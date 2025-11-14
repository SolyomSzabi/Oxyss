# Database Export - Oxy'ss Barbershop

Export Date: November 14, 2025

## Collection Files

This directory contains separate JSON files for each MongoDB collection:

### 1. services.json (12 documents)
Contains all barbershop services offered:
- Service ID, name, description
- Duration (in minutes)
- Base price (in RON)
- Category (Men, Women, Kids)

### 2. barbers.json (3 documents)
Contains barber profiles:
- Barber ID, name, description
- Years of experience
- Specialties
- Profile image URL
- Availability status

Barbers:
- Oxy (Master barber, 15 years experience)
- Helga (Expert stylist, 8 years experience)
- Marcus (Experienced barber, 12 years experience)

### 3. barber_services.json (11 documents)
Contains custom pricing for each barber-service combination:
- Links barber_id to service_id
- Custom price for that barber
- Availability flag

### 4. appointments.json (36 documents)
Contains all appointment records:
- Customer information (name, email, phone)
- Service and barber details
- Appointment date and time
- Duration and price
- Status (pending, confirmed, completed, cancelled)
- Creation timestamp

### 5. barber_breaks.json (5 documents)
Contains scheduled breaks for barbers:
- Barber ID
- Break date
- Start and end time
- Break title/description

### 6. barber_auth.json (3 documents)
Contains authentication credentials for barbers:
- Barber ID
- Email address
- Password hash (bcrypt)
- Active status

**Default Credentials:**
- oxy@oxyssbarbershop.com / barber123
- helga@oxyssbarbershop.com / barber123
- marcus@oxyssbarbershop.com / barber123

### 7. contact_messages.json (4 documents)
Contains customer contact form submissions:
- Customer name and email
- Message content
- Submission timestamp

## Import Instructions

### Option 1: Import All Collections
Use the combined export file `/app/database_export.json` with the `/__import_db` endpoint.

### Option 2: Import Individual Collections
Use MongoDB import commands for each file:

```bash
mongoimport --db oxys_barbershop --collection services --file services.json --jsonArray
mongoimport --db oxys_barbershop --collection barbers --file barbers.json --jsonArray
mongoimport --db oxys_barbershop --collection barber_services --file barber_services.json --jsonArray
mongoimport --db oxys_barbershop --collection appointments --file appointments.json --jsonArray
mongoimport --db oxys_barbershop --collection barber_breaks --file barber_breaks.json --jsonArray
mongoimport --db oxys_barbershop --collection barber_auth --file barber_auth.json --jsonArray
mongoimport --db oxys_barbershop --collection contact_messages --file contact_messages.json --jsonArray
```

## Database Statistics

- **Total Collections:** 7
- **Total Documents:** 74
- **Export Size:** ~44 KB

## Notes

- All prices are in Romanian Lei (RON)
- All timestamps are in UTC
- Password hashes use bcrypt encryption
- Service durations are in minutes
- Appointment times use 24-hour format

## Collection Relationships

```
barbers (1) ←──→ (N) barber_services ←──→ (1) services
   │                                           │
   │                                           │
   └────→ appointments ←──────────────────────┘
   │
   └────→ barber_breaks
   │
   └────→ barber_auth
```
