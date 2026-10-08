"""Public catalogue data: barbers, services and per-barber service offerings."""

from pydantic import BaseModel, ConfigDict


class Barber(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    description: str = ""
    description_hu: str = ""
    description_ro: str = ""
    experience_years: int = 0
    specialties: list[str] = []
    image_url: str | None = None
    is_available: bool = True


class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    name_hu: str = ""
    name_ro: str = ""
    description: str = ""
    description_hu: str = ""
    description_ro: str = ""
    duration: int  # minutes
    base_price: float  # RON; a barber may charge a different price
    category: str = "Men"


class BarberServiceOffer(BaseModel):
    """A service as offered by one barber, with that barber's price."""

    id: str
    barber_id: str
    service_id: str
    price: float
    is_available: bool
    service_name: str
    service_name_hu: str
    service_name_ro: str
    service_description: str
    service_description_hu: str
    service_description_ro: str
    duration: int
    category: str = "Men"
