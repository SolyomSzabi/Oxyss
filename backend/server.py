from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper functions for MongoDB serialization
def prepare_for_mongo(data):
    if isinstance(data.get('date'), date):
        data['date'] = data['date'].isoformat()
    if isinstance(data.get('appointment_date'), date):
        data['appointment_date'] = data['appointment_date'].isoformat()
    if isinstance(data.get('time'), time):
        data['time'] = data['time'].strftime('%H:%M:%S')
    if isinstance(data.get('appointment_time'), time):
        data['appointment_time'] = data['appointment_time'].strftime('%H:%M:%S')
    return data

def parse_from_mongo(item):
    if isinstance(item.get('date'), str):
        item['date'] = datetime.fromisoformat(item['date']).date()
    if isinstance(item.get('appointment_date'), str):
        item['appointment_date'] = datetime.fromisoformat(item['appointment_date']).date()
    if isinstance(item.get('time'), str):
        item['time'] = datetime.strptime(item['time'], '%H:%M:%S').time()
    if isinstance(item.get('appointment_time'), str):
        item['appointment_time'] = datetime.strptime(item['appointment_time'], '%H:%M:%S').time()
    return item

# Models
class Barber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    experience_years: int
    specialties: List[str]
    image_url: Optional[str] = None
    is_available: bool = True

class BarberCreate(BaseModel):
    name: str
    description: str
    experience_years: int
    specialties: List[str]
    image_url: Optional[str] = None
    is_available: bool = True

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    duration: int  # in minutes
    base_price: float  # base price, can be overridden per barber

class ServiceCreate(BaseModel):
    name: str
    description: str
    duration: int
    base_price: float

class BarberService(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    barber_id: str
    service_id: str
    price: float  # barber-specific price for this service
    is_available: bool = True

class BarberServiceCreate(BaseModel):
    barber_id: str
    service_id: str
    price: float
    is_available: bool = True

class BarberServiceWithDetails(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    barber_id: str
    service_id: str
    price: float
    is_available: bool
    service_name: str
    service_description: str
    duration: int

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    service_id: str
    service_name: str
    barber_id: str
    barber_name: str
    appointment_date: date
    appointment_time: time
    status: str = "pending"  # pending, confirmed, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    service_id: str
    service_name: str
    barber_id: str
    barber_name: str
    appointment_date: date
    appointment_time: time

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Oxy'ss Barbershop API"}

# Barbers endpoints
@api_router.get("/barbers", response_model=List[Barber])
async def get_barbers():
    barbers = await db.barbers.find({}, {"_id": 0}).to_list(1000)
    return barbers

@api_router.post("/barbers", response_model=Barber)
async def create_barber(barber_data: BarberCreate):
    barber_dict = barber_data.model_dump()
    barber_obj = Barber(**barber_dict)
    
    doc = barber_obj.model_dump()
    _ = await db.barbers.insert_one(doc)
    return barber_obj

@api_router.get("/barbers/{barber_id}", response_model=Barber)
async def get_barber(barber_id: str):
    barber = await db.barbers.find_one({"id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    return barber

# Services endpoints
@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate):
    service_dict = service_data.model_dump()
    service_obj = Service(**service_dict)
    
    doc = service_obj.model_dump()
    _ = await db.services.insert_one(doc)
    return service_obj

# Appointments endpoints
@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments():
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    
    # Parse dates and times from MongoDB
    for appointment in appointments:
        appointment = parse_from_mongo(appointment)
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointments

@api_router.get("/barbers/{barber_id}/appointments", response_model=List[Appointment])
async def get_barber_appointments(barber_id: str, status: Optional[str] = None, date_from: Optional[str] = None, date_to: Optional[str] = None):
    # Build query filter
    query_filter = {"barber_id": barber_id}
    
    if status:
        query_filter["status"] = status
        
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        if date_filter:
            query_filter["appointment_date"] = date_filter
    
    appointments = await db.appointments.find(query_filter, {"_id": 0}).sort("appointment_date", 1).to_list(1000)
    
    # Parse dates and times from MongoDB
    for appointment in appointments:
        appointment = parse_from_mongo(appointment)
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointments

@api_router.get("/appointments/today", response_model=List[Appointment])
async def get_today_appointments():
    today = datetime.now(timezone.utc).date().isoformat()
    appointments = await db.appointments.find({"appointment_date": today}, {"_id": 0}).sort("appointment_time", 1).to_list(1000)
    
    # Parse dates and times from MongoDB
    for appointment in appointments:
        appointment = parse_from_mongo(appointment)
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointments

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    appointment_dict = appointment_data.model_dump()
    appointment_obj = Appointment(**appointment_dict)
    
    # Prepare for MongoDB storage
    doc = prepare_for_mongo(appointment_obj.model_dump())
    doc['created_at'] = doc['created_at'].isoformat()
    
    _ = await db.appointments.insert_one(doc)
    return appointment_obj

@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment = parse_from_mongo(appointment)
    if isinstance(appointment['created_at'], str):
        appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointment

@api_router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str):
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment status updated successfully", "status": status}

class StatusUpdate(BaseModel):
    status: str

@api_router.patch("/appointments/{appointment_id}")
async def update_appointment_status_body(appointment_id: str, status_update: StatusUpdate):
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status_update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment status updated successfully", "status": status_update.status}

# Contact messages endpoints
@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate):
    message_dict = message_data.model_dump()
    message_obj = ContactMessage(**message_dict)
    
    doc = message_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    _ = await db.contact_messages.insert_one(doc)
    return message_obj

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(1000)
    
    for message in messages:
        if isinstance(message['created_at'], str):
            message['created_at'] = datetime.fromisoformat(message['created_at'])
    
    return messages

# Initialize default barbers and services
@api_router.post("/init-data")
async def initialize_data():
    # Initialize barbers if not exists
    existing_barbers = await db.barbers.count_documents({})
    if existing_barbers == 0:
        default_barbers = [
            {
                "id": str(uuid.uuid4()),
                "name": "Oxy",
                "description": "Master barber and founder with exceptional skills in classic and modern cuts",
                "experience_years": 15,
                "specialties": ["Classic cuts", "Fades", "Beard styling", "Hot towel shaves"],
                "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                "is_available": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Helga",
                "description": "Expert stylist specializing in modern cuts and precision beard work",
                "experience_years": 8,
                "specialties": ["Modern styles", "Precision cuts", "Beard trimming", "Hair treatments"],
                "image_url": "https://images.unsplash.com/photo-1594736797933-d0401ba5fe65?w=400&h=400&fit=crop&crop=face",
                "is_available": True
            }
        ]
        await db.barbers.insert_many(default_barbers)
    
    # Initialize services if not exists
    existing_services = await db.services.count_documents({})
    if existing_services == 0:
        default_services = [
            {
                "id": str(uuid.uuid4()),
                "name": "Classic Haircut",
                "description": "Traditional men's haircut with wash and style",
                "duration": 45,
                "price": 35.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Beard Trim & Style",
                "description": "Professional beard trimming and styling",
                "duration": 30,
                "price": 25.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Premium Cut & Beard",
                "description": "Complete grooming package with haircut and beard service",
                "duration": 75,
                "price": 55.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Hot Towel Shave",
                "description": "Traditional hot towel shave with premium products",
                "duration": 45,
                "price": 40.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Kids Haircut",
                "description": "Haircut for children under 12",
                "duration": 30,
                "price": 20.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Senior Haircut",
                "description": "Haircut for seniors (65+)",
                "duration": 45,
                "price": 28.00
            }
        ]
        await db.services.insert_many(default_services)
    
    barber_count = await db.barbers.count_documents({})
    service_count = await db.services.count_documents({})
    
    return {
        "message": "Data initialized successfully",
        "barbers_count": barber_count,
        "services_count": service_count
    }

# Legacy endpoint for backward compatibility
@api_router.post("/init-services")
async def initialize_services():
    result = await initialize_data()
    return {"message": result["message"], "services_initialized": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()