from fastapi import APIRouter

from app.schemas.reviews import ReviewSummary
from app.services import reviews

router = APIRouter(tags=["misc"])


@router.get("/")
async def root():
    return {"message": "Oxy'ss Barbershop API"}


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/reviews", response_model=ReviewSummary)
async def get_reviews():
    return await reviews.get_reviews()
