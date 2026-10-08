"""Google Places reviews, cached so page views do not each cost an API call."""

import asyncio
import logging
import time

import httpx

from app.core.business import SHOP_NAME
from app.core.config import get_settings
from app.core.errors import AppError, ServiceUnavailableError
from app.schemas.reviews import Review, ReviewSummary

logger = logging.getLogger(__name__)

PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
CACHE_SECONDS = 60 * 60
MAX_REVIEWS = 6

_cache: tuple[float, ReviewSummary] | None = None
_lock = asyncio.Lock()


class UpstreamError(AppError):
    status_code = 502


async def get_reviews() -> ReviewSummary:
    global _cache
    settings = get_settings()
    if not settings.google_reviews_enabled:
        raise ServiceUnavailableError("Reviews are not available")

    async with _lock:
        if _cache and time.monotonic() - _cache[0] < CACHE_SECONDS:
            return _cache[1]
        summary = await _fetch(settings.google_place_id, settings.google_api_key.get_secret_value())
        _cache = (time.monotonic(), summary)
        return summary


async def _fetch(place_id: str, api_key: str) -> ReviewSummary:
    params = {
        "place_id": place_id,
        "fields": "name,rating,reviews,user_ratings_total",
        "language": "hu",
        "key": api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(PLACES_DETAILS_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError):
        # Do not log the exception text: the request URL contains the API key.
        logger.error("Fetching Google reviews failed")
        raise UpstreamError("Reviews are temporarily unavailable") from None

    result = data.get("result", {})
    top = sorted(result.get("reviews", []), key=lambda r: r.get("rating", 0), reverse=True)[:MAX_REVIEWS]
    return ReviewSummary(
        salonName=result.get("name", SHOP_NAME),
        overallRating=result.get("rating"),
        totalRatings=result.get("user_ratings_total"),
        reviews=[
            Review(
                author=r.get("author_name"),
                avatar=r.get("profile_photo_url"),
                rating=r.get("rating"),
                text=r.get("text", ""),
                time=r.get("relative_time_description", ""),
            )
            for r in top
        ],
    )
