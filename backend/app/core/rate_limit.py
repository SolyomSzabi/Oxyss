"""Small in-memory sliding-window rate limiter.

State is per process, which is enough for this app (one uvicorn worker per machine). If the API is
ever scaled out to many machines, move this to a shared store such as Redis.
"""

import time
from collections import deque

from fastapi import HTTPException, Request, status

from app.core.config import get_settings

_MAX_TRACKED_KEYS = 10_000


class RateLimiter:
    def __init__(self, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = {}

    def hit(self, key: str) -> bool:
        """Record a request for `key`; return False when the key is over its limit."""
        now = time.monotonic()
        if len(self._hits) > _MAX_TRACKED_KEYS:
            self._prune(now)
        hits = self._hits.setdefault(key, deque())
        while hits and hits[0] <= now - self.window:
            hits.popleft()
        if len(hits) >= self.limit:
            return False
        hits.append(now)
        return True

    def reset(self) -> None:
        self._hits.clear()

    def _prune(self, now: float) -> None:
        cutoff = now - self.window
        for key in [k for k, v in self._hits.items() if not v or v[-1] <= cutoff]:
            del self._hits[key]


def client_ip(request: Request) -> str:
    header = get_settings().client_ip_header
    if header and (forwarded := request.headers.get(header)):
        return forwarded.strip()
    return request.client.host if request.client else "unknown"


def enforce(limiter: RateLimiter, key: str) -> None:
    if not limiter.hit(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests, please try again later",
            headers={"Retry-After": str(int(limiter.window))},
        )


def limit_by_ip(limiter: RateLimiter, scope: str):
    """FastAPI dependency that rate-limits a route per client IP."""

    def dependency(request: Request) -> None:
        enforce(limiter, f"{scope}:{client_ip(request)}")

    return dependency


login_ip_limiter = RateLimiter(limit=10, window_seconds=5 * 60)
login_account_limiter = RateLimiter(limit=20, window_seconds=15 * 60)
booking_limiter = RateLimiter(limit=5, window_seconds=10 * 60)
availability_limiter = RateLimiter(limit=120, window_seconds=60)

ALL_LIMITERS = (login_ip_limiter, login_account_limiter, booking_limiter, availability_limiter)
