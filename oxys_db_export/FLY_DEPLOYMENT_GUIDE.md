# Fly.io Deployment Guide - Oxy's Barbershop Backend

This guide walks you through deploying the Oxy's Barbershop FastAPI backend to Fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io/app/sign-up)
2. **Fly CLI**: Install flyctl
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```
3. **MongoDB Database**: MongoDB Atlas (free tier available) or another hosted MongoDB

## Step 1: Setup MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Fly.io
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

## Step 2: Login to Fly.io

```bash
fly auth login
```

## Step 3: Initialize Fly.io App

Navigate to the backend directory:
```bash
cd backend
```

Launch the app (this will use the existing fly.toml):
```bash
fly launch --no-deploy
```

When prompted:
- App name: `oxys-barbershop-api` (or your preference)
- Region: Select one close to Romania (e.g., Amsterdam - ams)
- PostgreSQL database: **No** (we're using MongoDB)
- Redis database: **No**

## Step 4: Set Environment Secrets

Set your sensitive environment variables as secrets:

```bash
# MongoDB connection string
fly secrets set MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"

# JWT Secret Key (generate a random one)
fly secrets set SECRET_KEY="$(openssl rand -hex 32)"

# Optional: Set specific CORS origins (for production)
# fly secrets set CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

## Step 5: Configure fly.toml (Optional)

The `fly.toml` file is already configured, but you can customize:

1. **App name**: Change `app = "oxys-barbershop-api"` to your app name
2. **Region**: Change `primary_region = "ams"` to your preferred region
3. **Memory**: Increase `memory_mb = 256` to 512 or 1024 if needed
4. **Auto-scaling**: Adjust `min_machines_running` (0 for free tier)

Available regions:
- `ams` - Amsterdam (Netherlands) - Closest to Romania
- `fra` - Frankfurt (Germany)
- `lhr` - London (United Kingdom)
- `waw` - Warsaw (Poland)

## Step 6: Deploy Application

```bash
fly deploy
```

This will:
1. Build the Docker image
2. Push to Fly.io registry
3. Deploy the application
4. Run health checks

Watch the deployment:
```bash
fly logs
```

## Step 7: Verify Deployment

Check the status:
```bash
fly status
```

Open your app:
```bash
fly open
```

Visit the API documentation:
```
https://your-app-name.fly.dev/docs
```

Test the API:
```bash
curl https://your-app-name.fly.dev/api/barbers
```

## Step 8: Import Database to MongoDB Atlas

1. Use MongoDB Compass or mongoimport to import your collections
2. Connect using your Atlas connection string
3. Import all JSON files from the `oxys_db_export` folder

## Useful Commands

### View logs
```bash
fly logs
fly logs -a oxys-barbershop-api
```

### Check app status
```bash
fly status
```

### View secrets
```bash
fly secrets list
```

### Update a secret
```bash
fly secrets set SECRET_KEY="new-value"
```

### Scale app
```bash
# Scale to 2 machines
fly scale count 2

# Scale memory
fly scale memory 512
```

### SSH into container
```bash
fly ssh console
```

### Restart app
```bash
fly apps restart
```

### Delete app
```bash
fly apps destroy oxys-barbershop-api
```

## Monitoring

### View metrics
```bash
fly dashboard
```

Or visit: https://fly.io/apps/your-app-name

### Set up monitoring
```bash
fly dashboard metrics
```

## Troubleshooting

### Issue: Build fails
**Solution**: Check Dockerfile and requirements.txt are correct
```bash
fly logs
```

### Issue: App crashes on startup
**Solution**: Check environment variables are set
```bash
fly secrets list
```

### Issue: Can't connect to MongoDB
**Solution**: 
1. Verify MONGO_URL is correct
2. Check MongoDB Atlas whitelist (0.0.0.0/0)
3. Test connection string locally first

### Issue: Health checks failing
**Solution**: Check the health check endpoint
```bash
fly logs --app oxys-barbershop-api
```

### Issue: CORS errors
**Solution**: Update CORS_ORIGINS secret
```bash
fly secrets set CORS_ORIGINS="https://yourdomain.com"
```

## Cost Optimization

### Free Tier Usage
- Fly.io offers 3 shared-cpu-1x VMs and 160GB outbound data transfer/month
- Set `min_machines_running = 0` for auto-sleep (cold starts ~1-2 seconds)
- Use `auto_stop_machines = true` to stop when idle

### Production Settings
- Set `min_machines_running = 1` for always-on
- Increase `memory_mb` to 512MB or 1024MB
- Add more workers in Dockerfile CMD

## Environment Variables Reference

Set via `fly secrets set`:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| MONGO_URL | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.net/` |
| SECRET_KEY | Yes | JWT signing key | Random 64-char hex string |
| DB_NAME | No | Database name (default in fly.toml) | `oxys_barbershop` |
| CORS_ORIGINS | No | Allowed origins (default: *) | `https://yourdomain.com` |

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database imported to Atlas
- [ ] MONGO_URL secret set with correct credentials
- [ ] SECRET_KEY set to secure random value
- [ ] CORS_ORIGINS set to your frontend domain
- [ ] fly.toml configured with correct region
- [ ] App deployed successfully
- [ ] Health checks passing
- [ ] API endpoints tested
- [ ] Logs monitored for errors
- [ ] Frontend updated with new backend URL

## Custom Domain (Optional)

To use a custom domain:

1. Add certificate:
   ```bash
   fly certs add api.yourdomain.com
   ```

2. Add DNS records (provided by Fly.io):
   ```
   CNAME api yourdomain.fly.dev
   ```

3. Verify:
   ```bash
   fly certs show api.yourdomain.com
   ```

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get API token:
```bash
fly tokens create deploy
```

Add to GitHub Secrets as `FLY_API_TOKEN`

## Support

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- Status Page: https://status.flyio.net/

## Next Steps

After deploying backend:
1. Update frontend `REACT_APP_BACKEND_URL` to Fly.io URL
2. Deploy frontend (Vercel, Netlify, etc.)
3. Test end-to-end functionality
4. Set up monitoring and alerts
5. Configure custom domain (optional)

---

Need help? Check Fly.io documentation or community forums!
