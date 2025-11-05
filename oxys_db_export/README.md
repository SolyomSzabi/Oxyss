# Oxy's Barbershop - Database & Environment Files

This package contains everything you need to run Oxy's Barbershop locally.

## 📦 What's Included

### Database Files (MongoDB)
- `services.json` - 12 services with categories
- `barbers.json` - 3 barber profiles
- `barber_services.json` - Custom pricing
- `appointments.json` - 21 appointments
- `barber_breaks.json` - Scheduled breaks
- `barber_auth.json` - Login credentials
- `contact_messages.json` - Contact form data
- `all_collections_combined.json` - Complete backup

### Environment Templates
- `backend.env.template` - Backend environment variables
- `frontend.env.template` - Frontend environment variables

### Documentation
- `LOCAL_SETUP_GUIDE.md` - Complete setup instructions ⭐ START HERE
- `QUICK_START.md` - Fast MongoDB import guide
- `IMPORT_INSTRUCTIONS.md` - Detailed import methods
- `README.md` - This file

## 🚀 Quick Start

1. **Read** `LOCAL_SETUP_GUIDE.md` for complete setup instructions
2. **Import** database using `QUICK_START.md`
3. **Copy** `.env.template` files to your project:
   - `backend.env.template` → `backend/.env`
   - `frontend.env.template` → `frontend/.env`
4. **Update** the `.env` files with your local configuration
5. **Run** the application!

## 📋 Prerequisites

- Node.js 16+
- Python 3.11+
- MongoDB 5.0+
- Yarn package manager

## 🔑 Test Credentials

- Email: `oxy@oxyssbarbershop.com`
- Password: `barber123`

## 📊 Database Info

- **Collections**: 7
- **Documents**: 58
- **Database Name**: test_database (rename as needed)
- **Currency**: RON (Romanian Lei)
- **Timezone**: Europe/Bucharest

## 📁 Files at a Glance

```
oxys_db_export/
├── README.md                          # This file
├── LOCAL_SETUP_GUIDE.md              # ⭐ Complete setup guide
├── QUICK_START.md                     # Fast database import
├── IMPORT_INSTRUCTIONS.md            # Detailed import methods
├── backend.env.template              # Backend environment config
├── frontend.env.template             # Frontend environment config
├── services.json                      # Services data
├── barbers.json                       # Barbers data
├── barber_services.json              # Pricing data
├── appointments.json                  # Appointments data
├── barber_breaks.json                # Breaks data
├── barber_auth.json                  # Auth credentials
├── contact_messages.json             # Contact form data
└── all_collections_combined.json     # Complete backup
```

## 💡 Next Steps

1. Extract all files to your project directory
2. Follow `LOCAL_SETUP_GUIDE.md` step by step
3. Import database using MongoDB Compass
4. Configure `.env` files
5. Start backend and frontend servers
6. Test the application!

## 🆘 Need Help?

Check the troubleshooting sections in:
- `LOCAL_SETUP_GUIDE.md` - Common setup issues
- `IMPORT_INSTRUCTIONS.md` - Import problems

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT with bcrypt

---

Happy coding! 🎉
