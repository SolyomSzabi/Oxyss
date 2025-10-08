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
class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    duration: int  # in minutes
    price: float

class ServiceCreate(BaseModel):
    name: str
    description: str
    duration: int
    price: float

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    service_id: str
    service_name: str
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

@api_router.patch("/appointments/{appointment_id}")
async def update_appointment_status(appointment_id: str, status: str):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment status updated successfully"}

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

# Initialize default services
@api_router.post("/init-services")
async def initialize_services():
    existing_services = await db.services.count_documents({})
    if existing_services > 0:
        return {"message": "Services already initialized"}
    
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
    return {"message": "Services initialized successfully"}

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