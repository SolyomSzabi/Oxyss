# Oxy's Barbershop Database Import Instructions

## Database Information
- **Database Name**: test_database
- **Export Date**: November 5, 2025
- **Collections**: 7
- **Total Documents**: 58

## Collections Overview

1. **services** (12 documents) - Barbershop services with pricing and categories
2. **barbers** (3 documents) - Barber profiles (Oxy, Helga, Marcus)
3. **barber_services** (11 documents) - Custom pricing per barber per service
4. **appointments** (21 documents) - Customer appointments
5. **barber_breaks** (4 documents) - Barber scheduled breaks
6. **barber_auth** (3 documents) - Barber login credentials (hashed passwords)
7. **contact_messages** (4 documents) - Contact form submissions

## Import Methods

### Method 1: Import via MongoDB Compass (Recommended)

1. **Open MongoDB Compass** and connect to your MongoDB instance
2. **Create Database**: 
   - Click "Create Database"
   - Database name: `test_database` (or your preferred name)
3. **Import Each Collection**:
   - For each `.json` file in this folder:
     - Create a new collection with the same name as the file (e.g., `services`, `barbers`, etc.)
     - Click on the collection
     - Click "Add Data" → "Import JSON or CSV file"
     - Select the corresponding `.json` file
     - Click "Import"

### Method 2: Import via mongoimport Command Line

```bash
# Navigate to the export directory
cd /tmp/oxys_db_export

# Import each collection (replace 'test_database' with your database name)
mongoimport --db test_database --collection services --file services.json --jsonArray
mongoimport --db test_database --collection barbers --file barbers.json --jsonArray
mongoimport --db test_database --collection barber_services --file barber_services.json --jsonArray
mongoimport --db test_database --collection appointments --file appointments.json --jsonArray
mongoimport --db test_database --collection barber_breaks --file barber_breaks.json --jsonArray
mongoimport --db test_database --collection barber_auth --file barber_auth.json --jsonArray
mongoimport --db test_database --collection contact_messages --file contact_messages.json --jsonArray
```

### Method 3: Import Combined File

Use `all_collections_combined.json` to import all collections at once programmatically.

## Default Credentials

### Barber Login Credentials:
- **Oxy**: 
  - Email: oxy@oxyssbarbershop.com
  - Password: barber123
  
- **Helga**: 
  - Email: helga@oxyssbarbershop.com
  - Password: barber123
  
- **Marcus**: 
  - Email: marcus@oxyssbarbershop.com
  - Password: barber123

## Important Notes

1. **Passwords**: All passwords are hashed using bcrypt
2. **Timezone**: Application uses Romanian timezone (Europe/Bucharest)
3. **Currency**: All prices are in RON (Romanian Lei)
4. **Date Format**: Dates are stored as ISO strings (YYYY-MM-DD)
5. **Time Format**: Times are stored as HH:MM:SS strings

## Collection Details

### Services
- Base services offered by the barbershop
- Categories: Men, Women, Kids
- Includes duration and base pricing

### Barbers
- Barber profiles with specialties and availability status
- Each has image URL and description

### Barber Services
- Custom pricing per barber for each service
- Links barber_id to service_id with custom price

### Appointments
- Customer bookings with date, time, and status
- Status values: confirmed, pending, completed, cancelled

### Barber Breaks
- Scheduled breaks for barbers
- Affects availability for appointments

## Support

If you encounter any issues during import, verify:
1. MongoDB is running
2. You have write permissions to the database
3. JSON files are valid (you can validate at jsonlint.com)
4. Collection names match exactly

