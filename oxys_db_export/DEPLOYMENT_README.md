# Deployment Files - Fly.io

This package now includes everything needed to deploy your backend to Fly.io!

## 🚀 New Files Added

### Docker Configuration
- **`Dockerfile`** - Multi-stage production-ready Docker image
  - Python 3.11 slim base
  - Optimized for small image size
  - Non-root user for security
  - Health checks included

- **`.dockerignore`** - Optimizes Docker build
  - Excludes unnecessary files
  - Reduces image size
  - Faster builds

### Fly.io Configuration
- **`fly.toml`** - Fly.io app configuration
  - Pre-configured for Amsterdam region (close to Romania)
  - Auto-scaling enabled
  - Health checks configured
  - HTTPS enforced
  - Optimized for 256MB memory

- **`FLY_DEPLOYMENT_GUIDE.md`** ⭐ - Complete deployment guide
  - Step-by-step instructions
  - MongoDB Atlas setup
  - Environment secrets configuration
  - Troubleshooting tips
  - Cost optimization

## 📋 Quick Deploy Steps

### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly.io
```bash
fly auth login
```

### 3. Setup MongoDB Atlas
- Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string

### 4. Deploy!
```bash
cd backend
fly launch --no-deploy
fly secrets set MONGO_URL="your-mongodb-connection-string"
fly secrets set SECRET_KEY="$(openssl rand -hex 32)"
fly deploy
```

## 📁 Where to Put These Files

Copy deployment files to your backend directory:

```bash
# From the oxys_db_export folder
cp Dockerfile ../backend/
cp fly.toml ../backend/
cp .dockerignore ../backend/
cp FLY_DEPLOYMENT_GUIDE.md ../backend/
```

Or if starting fresh:
- Place all files in the same directory as `server.py`
- Ensure `requirements.txt` is present

## 🌍 Why Fly.io?

- ✅ **Free Tier**: 3 shared VMs + 160GB bandwidth/month
- ✅ **Global Edge Network**: Deploy close to Romania (Amsterdam)
- ✅ **Auto-scaling**: Sleep when idle, wake on request
- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **Easy Deployment**: One command deploys
- ✅ **Docker-based**: Uses standard containers

## 💰 Estimated Costs

### Free Tier (Sufficient for testing/small production)
- 3 shared-cpu-1x VMs (256MB RAM each)
- 160GB outbound data transfer
- No credit card required initially

### If You Exceed Free Tier
- Shared CPU VM: ~$2/month per VM
- 1GB RAM: ~$0.15/GB/month
- Additional bandwidth: ~$0.02/GB

## 🔐 Environment Variables Required

You'll need to set these secrets on Fly.io:

1. **MONGO_URL** (Required)
   - Your MongoDB Atlas connection string
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/`

2. **SECRET_KEY** (Required)
   - JWT signing key
   - Generate: `openssl rand -hex 32`

3. **CORS_ORIGINS** (Optional)
   - Your frontend domain
   - Default: `*` (allows all origins)

## 📖 Full Documentation

For complete deployment instructions, see:
- **`FLY_DEPLOYMENT_GUIDE.md`** - Detailed step-by-step guide

## 🆘 Need Help?

### Common Issues
1. **Build fails**: Check `requirements.txt` is complete
2. **Can't connect to DB**: Verify MongoDB Atlas whitelist (0.0.0.0/0)
3. **App crashes**: Check secrets are set (`fly secrets list`)

### Resources
- Fly.io Docs: https://fly.io/docs/
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Community: https://community.fly.io/

## ✅ Deployment Checklist

Before deploying:
- [ ] MongoDB Atlas cluster created
- [ ] Database data imported to Atlas
- [ ] Fly.io account created
- [ ] Fly CLI installed
- [ ] `Dockerfile` in backend directory
- [ ] `fly.toml` in backend directory
- [ ] `.dockerignore` in backend directory

After first deployment:
- [ ] Secrets set (MONGO_URL, SECRET_KEY)
- [ ] App deployed successfully (`fly deploy`)
- [ ] Health check passing (`fly status`)
- [ ] API accessible (`https://your-app.fly.dev/docs`)
- [ ] Test endpoints work

## 🎯 What's Next?

After deploying backend to Fly.io:
1. Note your backend URL: `https://your-app-name.fly.dev`
2. Update frontend `REACT_APP_BACKEND_URL`
3. Deploy frontend (Vercel, Netlify, etc.)
4. Test complete application
5. Set up custom domain (optional)

---

Happy deploying! 🚀
