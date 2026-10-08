"""HTTP security headers for every API response."""

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

_BASE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}
_PRODUCTION_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    # The API only serves JSON; the interactive docs are disabled in production.
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, production: bool) -> None:
        super().__init__(app)
        self.headers = {**_BASE_HEADERS, **(_PRODUCTION_HEADERS if production else {})}

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        for name, value in self.headers.items():
            response.headers.setdefault(name, value)
        if "authorization" in request.headers:
            response.headers["Cache-Control"] = "no-store"
        return response
