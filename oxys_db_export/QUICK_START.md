# Quick Start Guide - MongoDB Compass Import

## 🚀 Fastest Way to Import

### Step 1: Download Files
Download all files from `/tmp/oxys_db_export/` or the compressed archive `oxys_database_export.tar.gz`

### Step 2: Open MongoDB Compass
1. Launch MongoDB Compass
2. Connect to your MongoDB instance
   - Default local: `mongodb://localhost:27017`

### Step 3: Create Database
1. Click **"CREATE DATABASE"** (green button, top left)
2. Enter:
   - Database Name: `oxys_barbershop` (or your preferred name)
   - Collection Name: `services` (we'll add more collections next)
3. Click **"CREATE DATABASE"**

### Step 4: Import Collections

For each JSON file, repeat these steps:

1. **Select your database** (`oxys_barbershop`) in the left sidebar
2. **Click the "+" button** next to "Collections" to add a new collection
3. **Collection names** (create these exactly as shown):
   - `services`
   - `barbers`
   - `barber_services`
   - `appointments`
   - `barber_breaks`
   - `barber_auth`
   - `contact_messages`

4. **Import data into each collection**:
   - Click on the collection name
   - Click **"ADD DATA"** → **"Import JSON or CSV file"**
   - Select the corresponding `.json` file
   - **IMPORTANT**: Make sure "Array" format is selected
   - Click **"Import"**

### Step 5: Verify Import

After importing all collections, verify:
- Total documents: 58
- Services: 12 documents
- Barbers: 3 documents
- Appointments: 21 documents

## 📊 What's Included

- **12 Services** with Romanian categories (Men/Women/Kids)
- **3 Barbers** (Oxy, Helga, Marcus) with profiles
- **21 Appointments** including today's bookings
- **4 Barber breaks** for schedule management
- **3 Barber accounts** with login credentials
- **11 Barber-service pricing** mappings
- **4 Contact messages** from customers

## 🔑 Test Login Credentials

After import, you can log in to the staff dashboard with:

- **Email**: oxy@oxyssbarbershop.com
- **Password**: barber123

(Also works for helga@ and marcus@)

## 💰 Currency & Timezone

- **Currency**: RON (Romanian Lei)
- **Timezone**: Europe/Bucharest (EET/EEST)
- **Date Format**: YYYY-MM-DD
- **Time Format**: HH:MM:SS

## ❓ Troubleshooting

**Problem**: Import fails with "Invalid JSON"
- **Solution**: Make sure you select "Array" format during import

**Problem**: Collections appear empty
- **Solution**: Refresh MongoDB Compass (press F5)

**Problem**: Can't create database
- **Solution**: Make sure you have write permissions

## 📞 Need Help?

Check `IMPORT_INSTRUCTIONS.md` for detailed step-by-step instructions with alternative import methods.
