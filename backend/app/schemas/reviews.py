from pydantic import BaseModel


class Review(BaseModel):
    author: str | None = None
    avatar: str | None = None
    rating: int | None = None
    text: str = ""
    time: str = ""


class ReviewSummary(BaseModel):
    salonName: str
    overallRating: float | None = None
    totalRatings: int | None = None
    reviews: list[Review]
