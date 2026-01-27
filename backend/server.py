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
from datetime import datetime, timezone, date, time, timedelta
import pytz
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status, BackgroundTasks
import aiosmtplib
from email.message import EmailMessage

# Romanian timezone
ROMANIAN_TZ = pytz.timezone('Europe/Bucharest')

def get_romanian_now():
    """Get current datetime in Romanian timezone"""
    return datetime.now(ROMANIAN_TZ)

def get_romanian_today():
    """Get today's date in Romanian timezone"""
    return get_romanian_now().date()

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Authentication setup
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-for-jwt-tokens-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# === TEMPORARY EXPORT ROUTE (for migration) ===
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pymongo import MongoClient
import os

export_router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")

# Use separate variables for sync export client to avoid overwriting async client
export_client = MongoClient(MONGO_URL)
export_db = export_client[DB_NAME]

@export_router.get("/__export_db")
def export_database():
    data = {}
    for collection_name in export_db.list_collection_names():
        documents = list(export_db[collection_name].find({}, {"_id": 0}))
        data[collection_name] = documents
    return JSONResponse(content=data)

app.include_router(export_router)
# === END EXPORT ROUTE ===

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Authentication helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_barber(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        barber_id: str = payload.get("sub")
        if barber_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    barber = await db.barbers.find_one({"id": barber_id}, {"_id": 0})
    if barber is None:
        raise credentials_exception
    return barber

# Helper functions for MongoDB serialization
def prepare_for_mongo(data):
    if isinstance(data.get('date'), date):
        data['date'] = data['date'].isoformat()
    if isinstance(data.get('appointment_date'), date):
        data['appointment_date'] = data['appointment_date'].isoformat()
    if isinstance(data.get('break_date'), date):
        data['break_date'] = data['break_date'].isoformat()
    if isinstance(data.get('time'), time):
        data['time'] = data['time'].strftime('%H:%M:%S')
    if isinstance(data.get('appointment_time'), time):
        data['appointment_time'] = data['appointment_time'].strftime('%H:%M:%S')
    if isinstance(data.get('start_time'), time):
        data['start_time'] = data['start_time'].strftime('%H:%M:%S')
    if isinstance(data.get('end_time'), time):
        data['end_time'] = data['end_time'].strftime('%H:%M:%S')
    return data

def parse_from_mongo(item):
    if isinstance(item.get('date'), str):
        item['date'] = datetime.fromisoformat(item['date']).date()
    if isinstance(item.get('appointment_date'), str):
        item['appointment_date'] = datetime.fromisoformat(item['appointment_date']).date()
    if isinstance(item.get('break_date'), str):
        item['break_date'] = datetime.fromisoformat(item['break_date']).date()
    if isinstance(item.get('time'), str):
        item['time'] = datetime.strptime(item['time'], '%H:%M:%S').time()
    if isinstance(item.get('appointment_time'), str):
        item['appointment_time'] = datetime.strptime(item['appointment_time'], '%H:%M:%S').time()
    if isinstance(item.get('start_time'), str):
        item['start_time'] = datetime.strptime(item['start_time'], '%H:%M:%S').time()
    if isinstance(item.get('end_time'), str):
        item['end_time'] = datetime.strptime(item['end_time'], '%H:%M:%S').time()
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
    category: str = "Men"  # Men, Women, Kids

class ServiceCreate(BaseModel):
    name: str
    description: str
    duration: int
    base_price: float
    category: str = "Men"

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
    category: str = "Men"

class BarberLogin(BaseModel):
    email: str
    password: str

class BarberAuth(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    barber_id: str
    email: EmailStr
    password_hash: str
    is_active: bool = True

class BarberAuthCreate(BaseModel):
    barber_id: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    barber_id: str
    barber_name: str

class BarberBreak(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    barber_id: str
    break_date: date
    start_time: time
    end_time: time
    title: str = "Break"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BarberBreakCreate(BaseModel):
    barber_id: str
    break_date: date
    start_time: time
    end_time: time
    title: str = "Break"

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
    duration: Optional[int] = None  # Duration in minutes (optional for backward compatibility)
    price: Optional[float] = None  # Price in RON (optional for backward compatibility)
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
    duration: Optional[int] = None

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

# Authentication endpoints
@api_router.post("/auth/login", response_model=Token)
async def login_barber(barber_login: BarberLogin):
    # Find barber auth by email
    barber_auth = await db.barber_auth.find_one({"email": barber_login.email}, {"_id": 0})
    if not barber_auth or not verify_password(barber_login.password, barber_auth["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get barber details
    barber = await db.barbers.find_one({"id": barber_auth["barber_id"]}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    access_token = create_access_token(data={"sub": barber_auth["barber_id"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "barber_id": barber_auth["barber_id"],
        "barber_name": barber["name"]
    }

@api_router.post("/auth/create", response_model=BarberAuth)
async def create_barber_auth(barber_auth_data: BarberAuthCreate):
    # Check if email already exists
    existing = await db.barber_auth.find_one({"email": barber_auth_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if barber exists
    barber = await db.barbers.find_one({"id": barber_auth_data.barber_id})
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    hashed_password = get_password_hash(barber_auth_data.password)
    auth_dict = barber_auth_data.model_dump()
    auth_dict["password_hash"] = hashed_password
    del auth_dict["password"]
    
    auth_obj = BarberAuth(**auth_dict)
    doc = auth_obj.model_dump()
    await db.barber_auth.insert_one(doc)
    return auth_obj

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

# Barber Services endpoints
@api_router.get("/barbers/{barber_id}/services", response_model=List[BarberServiceWithDetails])
async def get_barber_services(barber_id: str):
    # Get barber services with service details
    pipeline = [
        {"$match": {"barber_id": barber_id, "is_available": True}},
        {"$lookup": {
            "from": "services",
            "localField": "service_id", 
            "foreignField": "id",
            "as": "service_info"
        }},
        {"$unwind": "$service_info"},
        {"$project": {
            "_id": 0,
            "id": 1,
            "barber_id": 1,
            "service_id": 1,
            "price": 1,
            "is_available": 1,
            "service_name": "$service_info.name",
            "service_description": "$service_info.description",
            "duration": "$service_info.duration",
            "category": "$service_info.category"
        }}
    ]
    
    barber_services = await db.barber_services.aggregate(pipeline).to_list(1000)
    return barber_services

@api_router.post("/barber-services", response_model=BarberService)
async def create_barber_service(barber_service_data: BarberServiceCreate):
    barber_service_dict = barber_service_data.model_dump()
    barber_service_obj = BarberService(**barber_service_dict)
    
    doc = barber_service_obj.model_dump()
    _ = await db.barber_services.insert_one(doc)
    return barber_service_obj

@api_router.get("/services/by-barber/{barber_id}")
async def get_services_by_barber(barber_id: str):
    """Get all services offered by a specific barber with their pricing"""
    return await get_barber_services(barber_id)

# Break management endpoints
@api_router.get("/barbers/{barber_id}/breaks", response_model=List[BarberBreak])
async def get_barber_breaks(barber_id: str, date_from: Optional[str] = None, date_to: Optional[str] = None):
    query_filter = {"barber_id": barber_id}
    
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        if date_filter:
            query_filter["break_date"] = date_filter
    
    breaks = await db.barber_breaks.find(query_filter, {"_id": 0}).sort("break_date", 1).to_list(1000)
    
    for break_item in breaks:
        break_item = parse_from_mongo(break_item)
        if isinstance(break_item['created_at'], str):
            break_item['created_at'] = datetime.fromisoformat(break_item['created_at'])
    
    return breaks

@api_router.post("/breaks", response_model=BarberBreak)
async def create_barber_break(break_data: BarberBreakCreate, current_barber: dict = Depends(get_current_barber)):
    # Verify barber can only create breaks for themselves
    if break_data.barber_id != current_barber["id"]:
        raise HTTPException(status_code=403, detail="Can only create breaks for yourself")
    
    break_dict = break_data.model_dump()
    break_obj = BarberBreak(**break_dict)
    
    doc = prepare_for_mongo(break_obj.model_dump())
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.barber_breaks.insert_one(doc)
    return break_obj

@api_router.delete("/breaks/{break_id}")
async def delete_barber_break(break_id: str, current_barber: dict = Depends(get_current_barber)):
    # Find the break first to verify ownership
    break_item = await db.barber_breaks.find_one({"id": break_id}, {"_id": 0})
    if not break_item:
        raise HTTPException(status_code=404, detail="Break not found")
    
    if break_item["barber_id"] != current_barber["id"]:
        raise HTTPException(status_code=403, detail="Can only delete your own breaks")
    
    result = await db.barber_breaks.delete_one({"id": break_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Break not found")
    
    return {"message": "Break deleted successfully"}

# Availability checking
@api_router.get("/barbers/{barber_id}/availability")
async def check_barber_availability(barber_id: str, date: str, start_time: str, duration: int):
    """Check if a barber is available at a specific date and time"""
    appointment_date = date
    start_time_obj = datetime.strptime(start_time, '%H:%M').time()
    
    # Check if the slot is in the past (Romanian timezone)
    appointment_datetime = datetime.fromisoformat(f"{date}T{start_time}:00")
    romanian_now = get_romanian_now()
    
    # If appointment is today, check if time has passed
    if date == get_romanian_today().isoformat():
        appointment_datetime_ro = ROMANIAN_TZ.localize(appointment_datetime)
        if appointment_datetime_ro <= romanian_now:
            return {"available": False, "reason": "Time slot is in the past"}
    
    # Calculate end time
    start_datetime = datetime.combine(datetime.fromisoformat(date).date(), start_time_obj)
    end_datetime = start_datetime + timedelta(minutes=duration)
    end_time_obj = end_datetime.time()
    
    # Check for existing appointments
    existing_appointments = await db.appointments.find({
        "barber_id": barber_id,
        "appointment_date": appointment_date,
        "status": {"$in": ["confirmed", "pending"]}
    }, {"_id": 0}).to_list(1000)
    
    # Check for breaks
    existing_breaks = await db.barber_breaks.find({
        "barber_id": barber_id,
        "break_date": appointment_date
    }, {"_id": 0}).to_list(1000)
    
    # Check time conflicts
    for appointment in existing_appointments:
        appt_start = datetime.strptime(appointment["appointment_time"][:5], '%H:%M').time()
        # Use actual duration from appointment, fallback to 45 if not set
        appt_duration = appointment.get("duration", 45)
        appt_end_datetime = datetime.combine(datetime.fromisoformat(date).date(), appt_start) + timedelta(minutes=appt_duration)
        appt_end = appt_end_datetime.time()
        
        if (start_time_obj < appt_end and end_time_obj > appt_start):
            return {"available": False, "reason": "Time slot conflicts with existing appointment"}
    
    for break_item in existing_breaks:
        break_start = datetime.strptime(break_item["start_time"][:5], '%H:%M').time()
        break_end = datetime.strptime(break_item["end_time"][:5], '%H:%M').time()
        
        if (start_time_obj < break_end and end_time_obj > break_start):
            return {"available": False, "reason": f"Time slot conflicts with break: {break_item['title']}"}
    
    return {"available": True, "reason": "Time slot available"}

@api_router.get("/barbers/{barber_id}/available-slots")
async def get_available_slots(barber_id: str, date: str, service_id: str):
    """Get all available time slots for a barber on a specific date for a specific service"""
    
    # Get service duration
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    duration = service["duration"]
    
    # Convert date string
    date_obj = datetime.fromisoformat(date).date()
    weekday = date_obj.weekday()  
    # 0 = hétfő, 5 = szombat, 6 = vasárnap
    
    # Nyitvatartási idők meghatározása
    if weekday in [0, 1, 2, 3, 4]:  
        # Hétfő – Péntek: 9:00 – 19:00
        business_start = time(9, 0)
        business_end = time(19, 0)
    elif weekday == 5:
        # Szombat: 9:00 – 13:00
        business_start = time(9, 0)
        business_end = time(13, 0)
    else:
        # Vasárnap: zárva → nincs időpont
        return {
            "date": date,
            "barber_id": barber_id,
            "service_duration": duration,
            "slots": []
        }
    
    # Generate all possible 15-minute time slots
    slots = []
    # date_obj = datetime.fromisoformat(date).date()
    current_time = datetime.combine(date_obj, business_start)
    end_time = datetime.combine(date_obj, business_end)
    
    while current_time + timedelta(minutes=duration) <= end_time:
        slot_time = current_time.time()
        
        # Check availability for this slot
        availability = await check_barber_availability(
            barber_id, 
            date, 
            slot_time.strftime('%H:%M'), 
            duration
        )
        
        slots.append({
            "time": slot_time.strftime('%H:%M'),
            "available": availability["available"],
            "reason": availability.get("reason", "")
        })
        
        # Move to next 15-minute slot
        current_time += timedelta(minutes=15)
    
    return {
        "date": date,
        "barber_id": barber_id,
        "service_duration": duration,
        "slots": slots
    }

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
async def get_barber_appointments(barber_id: str, status: Optional[str] = None, date_from: Optional[str] = None, date_to: Optional[str] = None, current_barber: dict = Depends(get_current_barber)):
    # Verify barber can only access their own appointments
    # if barber_id != current_barber["id"]:
    #     raise HTTPException(status_code=403, detail="Can only access your own appointments")
    
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

@api_router.get("/barbers/{barber_id}/appointments/today", response_model=List[Appointment])
async def get_barber_today_appointments(barber_id: str, current_barber: dict = Depends(get_current_barber)):
    # For all staff view, allow any authenticated barber to see all appointments
    # No restriction on barber_id check for this endpoint
    
    today = get_romanian_today().isoformat()
    query_filter = {
        "barber_id": barber_id,
        "appointment_date": today
    }
    
    appointments = await db.appointments.find(query_filter, {"_id": 0}).sort("appointment_time", 1).to_list(1000)
    
    # Parse dates and times from MongoDB
    for appointment in appointments:
        appointment = parse_from_mongo(appointment)
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointments

@api_router.get("/appointments/today", response_model=List[Appointment])
async def get_today_appointments():
    today = get_romanian_today().isoformat()
    appointments = await db.appointments.find({"appointment_date": today}, {"_id": 0}).sort("appointment_time", 1).to_list(1000)
    
    # Parse dates and times from MongoDB
    for appointment in appointments:
        appointment = parse_from_mongo(appointment)
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointments



EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))


async def send_email(to: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = EMAIL_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            start_tls=True,
            username=EMAIL_USERNAME,
            password=EMAIL_PASSWORD,
        )
        print("Email sent successfully")
    except Exception as e:
        print("Email sending failed:", e)
        raise



@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate, background_tasks: BackgroundTasks):
    # Get service duration for availability check
    service = await db.services.find_one({"id": appointment_data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get barber-specific price or fall back to base price
    barber_service = await db.barber_services.find_one(
        {"barber_id": appointment_data.barber_id, "service_id": appointment_data.service_id},
        {"_id": 0}
    )
    
    price = barber_service["price"] if barber_service else service["base_price"]
    duration = appointment_data.duration if appointment_data.duration else service["duration"]
    
    # Check availability
    availability = await check_barber_availability(
        appointment_data.barber_id,
        appointment_data.appointment_date.isoformat(),
        appointment_data.appointment_time.strftime('%H:%M'),
        duration
    )
    
    if not availability["available"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Time slot not available: {availability['reason']}"
        )
    
    appointment_dict = appointment_data.model_dump()
    # Set status to confirmed directly (no pending state)
    appointment_dict["status"] = "confirmed"
    # Add duration and price
    appointment_dict["duration"] = duration
    appointment_dict["price"] = price
    appointment_obj = Appointment(**appointment_dict)
    
    # Prepare for MongoDB storage
    doc = prepare_for_mongo(appointment_obj.model_dump())
    doc['created_at'] = doc['created_at'].isoformat()
    
    _ = await db.appointments.insert_one(doc)


    # AUTOMATIKUS EMAIL KÜLDÉS
    background_tasks.add_task(
        send_email,
        to=appointment_obj.customer_email,
        subject="Confirmare / Visszaigazolás / Confirmation – Oxyss Style",
        body=f"""
🇷🇴 Confirmare Programare – Oxyss Style

Dragă {appointment_obj.customer_name},

Îți mulțumim că ai efectuat o programare la Oxyss Style!

Detaliile programării tale:

• Serviciu: {appointment_obj.service_name}
• Stilist: {appointment_obj.barber_name}
• Dată: {appointment_obj.appointment_date}
• Ora: {appointment_obj.appointment_time.strftime("%H:%M")}
• Durată estimată: {appointment_obj.duration} minute
• Preț: {appointment_obj.price} RON

Dacă dorești să modifici sau să anulezi programarea, ne poți contacta la:
Telefon: +40 74 116 1016

Te așteptăm cu drag în salonul nostru!

Cu respect,
{appointment_obj.barber_name} și echipa Oxyss Style

------------------------------------------------------------

🇭🇺 Foglalás visszaigazolása – Oxyss Style

Kedves {appointment_obj.customer_name},

Köszönjük, hogy időpontot foglalt az Oxyss Style szalonba!

Az alábbiakban megtalálod a foglalásod részleteit:

• Szolgáltatás: {appointment_obj.service_name}
• Fodrász: {appointment_obj.barber_name}
• Dátum: {appointment_obj.appointment_date}
• Időpont: {appointment_obj.appointment_time.strftime("%H:%M")}
• Várható időtartam: {appointment_obj.duration} perc
• Ár: {appointment_obj.price} RON

Amennyiben módosítanád vagy lemondanád az időpontot, kérjük vedd fel velünk a kapcsolatot:
Telefon: +40 74 116 1016

Várunk szeretettel az Oxyss Style szalonban!

Üdvözlettel,
{appointment_obj.barber_name} és az Oxyss Style csapat

------------------------------------------------------------

🇬🇧 Appointment Confirmation – Oxyss Style

Dear {appointment_obj.customer_name},

Thank you for booking an appointment at Oxyss Style!

Here are the details of your appointment:

• Service: {appointment_obj.service_name}
• Hair Stylist: {appointment_obj.barber_name}
• Date: {appointment_obj.appointment_date}
• Time: {appointment_obj.appointment_time.strftime("%H:%M")}
• Estimated duration: {appointment_obj.duration} minutes
• Price: {appointment_obj.price} RON

If you need to modify or cancel your appointment, feel free to contact us:
Phone: +40 74 116 1016

We look forward to welcoming you at Oxyss Style!

Best regards,
{appointment_obj.barber_name} and the Oxyss Style Team
"""
    )
    # -----------------------------

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

@api_router.patch("/appointments/{appointment_id}/duration")
async def update_appointment_duration(appointment_id: str, duration_update: dict, current_barber: dict = Depends(get_current_barber)):
    """Update appointment duration - only the assigned barber can reduce their appointment time"""
    
    # Verify appointment exists and belongs to this barber
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment["barber_id"] != current_barber["id"]:
        raise HTTPException(status_code=403, detail="Can only modify your own appointments")
    
    new_duration = duration_update.get("duration")
    if not new_duration or new_duration < 15:
        raise HTTPException(status_code=400, detail="Duration must be at least 15 minutes")
    
    # Don't allow increasing duration, only reducing
    if new_duration > appointment["duration"]:
        raise HTTPException(status_code=400, detail="Can only reduce duration, not increase")
    
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"duration": new_duration}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {
        "message": "Appointment duration updated successfully", 
        "duration": new_duration,
        "appointment_id": appointment_id
    }

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, current_barber: dict = Depends(get_current_barber)):
    """Delete an appointment - authenticated barbers only"""
    
    # Verify appointment exists
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Delete the appointment
    result = await db.appointments.delete_one({"id": appointment_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {
        "message": "Appointment deleted successfully", 
        "appointment_id": appointment_id,
        "customer_name": appointment.get("customer_name", ""),
        "appointment_time": appointment.get("appointment_time", "")
    }    

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
    service_ids = {}
    if existing_services == 0:
        default_services = [
            {
                "id": str(uuid.uuid4()),
                "name": "Classic Haircut",
                "description": "Traditional men's haircut with wash and style",
                "duration": 45,
                "base_price": 35.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Beard Trim & Style",
                "description": "Professional beard trimming and styling",
                "duration": 30,
                "base_price": 25.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Premium Cut & Beard",
                "description": "Complete grooming package with haircut and beard service",
                "duration": 75,
                "base_price": 55.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Hot Towel Shave",
                "description": "Traditional hot towel shave with premium products",
                "duration": 45,
                "base_price": 40.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Kids Haircut",
                "description": "Haircut for children under 12",
                "duration": 30,
                "base_price": 20.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Senior Haircut",
                "description": "Haircut for seniors (65+)",
                "duration": 45,
                "base_price": 28.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Mustache Trim",
                "description": "Professional mustache grooming and styling",
                "duration": 20,
                "base_price": 15.00
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Hair Wash & Style",
                "description": "Deep cleansing wash with professional styling",
                "duration": 30,
                "base_price": 22.00
            }
        ]
        await db.services.insert_many(default_services)
        
        # Store service IDs for barber service assignment
        for service in default_services:
            service_ids[service["name"]] = service["id"]
    else:
        # Get existing service IDs
        services = await db.services.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)
        for service in services:
            service_ids[service["name"]] = service["id"]

    # Initialize barber services if not exists
    existing_barber_services = await db.barber_services.count_documents({})
    if existing_barber_services == 0:
        # Get barber IDs
        barbers_data = await db.barbers.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)
        
        # Define barber-specific services and pricing
        barber_service_assignments = {
            "Oxy": {  # Master barber - premium pricing, all services
                "Classic Haircut": 40.00,
                "Beard Trim & Style": 28.00,
                "Premium Cut & Beard": 65.00,
                "Hot Towel Shave": 45.00,
                "Kids Haircut": 25.00,
                "Senior Haircut": 32.00,
                "Mustache Trim": 18.00,
                "Hair Wash & Style": 25.00
            },
            "Helga": {  # Modern specialist - competitive pricing, modern focus
                "Classic Haircut": 35.00,
                "Beard Trim & Style": 30.00,  # Higher for precision work
                "Premium Cut & Beard": 60.00,
                "Kids Haircut": 22.00,
                "Senior Haircut": 28.00,
                "Hair Wash & Style": 24.00
                # Note: Doesn't offer Hot Towel Shave or Mustache Trim
            }
        }
        
        barber_services_to_create = []
        for barber in barbers_data:
            barber_name = barber["name"]
            if barber_name in barber_service_assignments:
                for service_name, price in barber_service_assignments[barber_name].items():
                    if service_name in service_ids:
                        barber_services_to_create.append({
                            "id": str(uuid.uuid4()),
                            "barber_id": barber["id"],
                            "service_id": service_ids[service_name],
                            "price": price,
                            "is_available": True
                        })
        
        if barber_services_to_create:
            await db.barber_services.insert_many(barber_services_to_create)
    
    # Initialize barber authentication if not exists
    existing_auth = await db.barber_auth.count_documents({})
    if existing_auth == 0:
        barbers_data = await db.barbers.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)
        
        auth_data_to_create = []
        for barber in barbers_data:
            barber_name = barber["name"].lower()
            auth_data_to_create.append({
                "id": str(uuid.uuid4()),
                "barber_id": barber["id"],
                "email": f"{barber_name}@oxyssbarbershop.com",
                "password_hash": get_password_hash("barber123"),  # Default password
                "is_active": True
            })
        
        if auth_data_to_create:
            await db.barber_auth.insert_many(auth_data_to_create)
    
    barber_count = await db.barbers.count_documents({})
    service_count = await db.services.count_documents({})
    barber_service_count = await db.barber_services.count_documents({})
    auth_count = await db.barber_auth.count_documents({})
    
    return {
        "message": "Data initialized successfully",
        "barbers_count": barber_count,
        "services_count": service_count,
        "barber_services_count": barber_service_count,
        "barber_auth_count": auth_count,
        "default_credentials": "Use email: {barber}@oxyssbarbershop.com, password: barber123"
    }

# Legacy endpoint for backward compatibility
@api_router.post("/init-services")
async def initialize_services():
    result = await initialize_data()
    return {"message": result["message"], "services_initialized": True}

# Migration endpoint to update existing services
@api_router.post("/migrate-services")
async def migrate_services():
    """Migrate existing services from 'price' to 'base_price' field"""
    # Update all services that have 'price' but not 'base_price'
    result = await db.services.update_many(
        {"price": {"$exists": True}, "base_price": {"$exists": False}},
        [{"$set": {"base_price": "$price"}}, {"$unset": "price"}]
    )
    
    return {
        "message": "Services migrated successfully",
        "updated_count": result.modified_count
    }

# Migration endpoint to update existing appointments with duration and price
@api_router.post("/migrate-appointments")
async def migrate_appointments():
    """
    Migrate existing appointments to add duration and price fields.
    This should be called once to update all existing appointments.
    """
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    # Get all appointments
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(10000)
    
    for appointment in appointments:
        try:
            # Skip if already has both duration and price
            if appointment.get('duration') is not None and appointment.get('price') is not None:
                skipped_count += 1
                continue
            
            # Get service information
            service = await db.services.find_one({"id": appointment["service_id"]}, {"_id": 0})
            if not service:
                print(f"Service not found for appointment {appointment['id']}")
                error_count += 1
                continue
            
            # Get barber-specific price or use base price
            barber_service = await db.barber_services.find_one(
                {"barber_id": appointment["barber_id"], "service_id": appointment["service_id"]},
                {"_id": 0}
            )
            
            price = barber_service["price"] if barber_service else service["base_price"]
            duration = service["duration"]
            
            # Update the appointment
            await db.appointments.update_one(
                {"id": appointment["id"]},
                {"$set": {"duration": duration, "price": price}}
            )
            
            updated_count += 1
            
        except Exception as e:
            print(f"Error migrating appointment {appointment.get('id')}: {str(e)}")
            error_count += 1
    
    return {
        "message": "Migration completed",
        "updated": updated_count,
        "skipped": skipped_count,
        "errors": error_count,
        "total": len(appointments)
    }

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