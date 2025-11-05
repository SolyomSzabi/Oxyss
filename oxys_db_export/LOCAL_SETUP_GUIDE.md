# Local Development Setup Guide - Oxy's Barbershop

## Prerequisites

Before starting, make sure you have installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.11 or higher) - [Download](https://www.python.org/)
3. **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
4. **Yarn** package manager - Install: `npm install -g yarn`

## Step 1: Clone/Download Project

Download the project files to your local machine and extract them to your desired location.

```bash
# Example structure:
oxys-barbershop/
├── backend/
├── frontend/
└── README.md
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB Installation

1. **Start MongoDB** service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Import Database** (using MongoDB Compass or mongoimport):
   - Follow instructions in `QUICK_START.md`
   - Or use: `mongoimport --db oxys_barbershop --collection services --file services.json --jsonArray`

### Option B: MongoDB Atlas (Cloud)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
3. Use this in your backend `.env` file

## Step 3: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create `.env` file**:
   ```bash
   # Copy the template
   cp ../oxys_db_export/backend.env.template .env
   
   # Edit .env file and update values:
   # - MONGO_URL: Your MongoDB connection string
   # - DB_NAME: oxys_barbershop (or your database name)
   # - SECRET_KEY: Generate using: openssl rand -hex 32
   ```

3. **Install Python dependencies**:
   ```bash
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Start Backend Server**:
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

   Server should start at: `http://localhost:8001`

5. **Test Backend**:
   - Open browser: `http://localhost:8001/docs`
   - You should see FastAPI Swagger documentation

## Step 4: Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Create `.env` file**:
   ```bash
   # Copy the template
   cp ../oxys_db_export/frontend.env.template .env
   
   # The file should contain:
   # REACT_APP_BACKEND_URL=http://localhost:8001
   ```

3. **Install Node.js dependencies**:
   ```bash
   yarn install
   # or if yarn is not available:
   npm install
   ```

4. **Start Frontend Development Server**:
   ```bash
   yarn start
   # or
   npm start
   ```

   Application should open at: `http://localhost:3000`

## Step 5: Verify Setup

1. **Check Backend**: Visit `http://localhost:8001/docs` - Should show API documentation
2. **Check Frontend**: Visit `http://localhost:3000` - Should show Oxy's Barbershop homepage
3. **Test Booking**: Try making a test appointment
4. **Test Login**: 
   - Go to Staff Login (footer link)
   - Email: `oxy@oxyssbarbershop.com`
   - Password: `barber123`

## Common Issues & Solutions

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'X'`
- **Solution**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

**Problem**: `pymongo.errors.ServerSelectionTimeoutError`
- **Solution**: 
  1. Check MongoDB is running: `mongod --version`
  2. Verify MONGO_URL in backend/.env
  3. Try: `mongodb://127.0.0.1:27017` instead of `localhost`

**Problem**: `SECRET_KEY not found`
- **Solution**: Add SECRET_KEY to backend/.env file

### Frontend Issues

**Problem**: `Module not found: Error: Can't resolve '@/components/ui/...'`
- **Solution**: 
  1. Delete `node_modules` and `yarn.lock`
  2. Run `yarn install` again

**Problem**: Frontend can't connect to backend (CORS errors)
- **Solution**: 
  1. Check REACT_APP_BACKEND_URL in frontend/.env
  2. Make sure backend is running on port 8001
  3. Verify CORS_ORIGINS=* in backend/.env

**Problem**: `REACT_APP_BACKEND_URL is not defined`
- **Solution**: Restart frontend server after creating/editing .env file

### Database Issues

**Problem**: Empty collections after import
- **Solution**: Make sure you selected "Array" format when importing JSON files in MongoDB Compass

**Problem**: Can't connect to MongoDB Atlas
- **Solution**: 
  1. Whitelist your IP address in Atlas Network Access
  2. Check username/password in connection string
  3. Replace `<password>` with actual password (no angle brackets)

## Project Structure

```
oxys-barbershop/
├── backend/
│   ├── .env                 # Environment variables (create from template)
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── ...
├── frontend/
│   ├── .env                # Environment variables (create from template)
│   ├── package.json        # Node.js dependencies
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── contexts/      # React contexts (Auth)
│   └── ...
└── oxys_db_export/        # Database export files
    ├── services.json
    ├── barbers.json
    └── ...
```

## Development Commands

### Backend
```bash
# Start server with auto-reload
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Run with custom port
uvicorn server:app --reload --port 8000

# Check Python version
python --version
```

### Frontend
```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Check Node version
node --version
```

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URL | MongoDB connection string | `mongodb://localhost:27017` |
| DB_NAME | Database name | `oxys_barbershop` |
| CORS_ORIGINS | Allowed origins | `*` (dev) or specific URLs |
| SECRET_KEY | JWT signing key | Random 64-char hex string |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_BACKEND_URL | Backend API URL | `http://localhost:8001` |
| WDS_SOCKET_PORT | WebSocket port (dev) | `0` |

## Production Deployment

For production deployment:

1. **Backend**:
   - Change SECRET_KEY to a secure random value
   - Set CORS_ORIGINS to your frontend domain
   - Use production MongoDB (Atlas recommended)
   - Use a production server (Gunicorn, not uvicorn)

2. **Frontend**:
   - Run `yarn build` to create production build
   - Update REACT_APP_BACKEND_URL to production backend URL
   - Deploy build folder to hosting (Vercel, Netlify, etc.)

3. **Database**:
   - Use MongoDB Atlas or managed hosting
   - Enable authentication
   - Whitelist only necessary IP addresses

## Support

If you encounter issues:
1. Check this guide's "Common Issues" section
2. Verify all prerequisites are installed
3. Make sure MongoDB is running
4. Check .env files are correctly configured
5. Look for error messages in terminal/console

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python), PyMongo
- **Database**: MongoDB
- **Authentication**: JWT tokens with bcrypt
- **Timezone**: Europe/Bucharest (EET/EEST)
- **Currency**: RON (Romanian Lei)
