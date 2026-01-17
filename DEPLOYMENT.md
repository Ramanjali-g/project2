# Endless Path - Deployment Guide

## Environment Variables Required

### Backend (.env)
```
MONGO_URL=your_mongodb_connection_string  # e.g., MongoDB Atlas
DB_NAME=endless_path_production
JWT_SECRET_KEY=your-secure-random-secret-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
CORS_ORIGINS=https://your-frontend-domain.com
PORT=8001  # Optional, most platforms set this automatically
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## Platform-Specific Instructions

### Render (Recommended)
1. **Backend Service:**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Add all environment variables above

2. **Frontend Service:**
   - Build Command: `cd frontend && yarn install && yarn build`
   - Start Command: `cd frontend && yarn start` (or use static site)
   - Add REACT_APP_BACKEND_URL

3. **Database:**
   - Use MongoDB Atlas (free tier available)
   - Get connection string and set as MONGO_URL

### Vercel (Frontend Only)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ]
}
```

### Railway
- Auto-detects requirements.txt and package.json
- Set environment variables in Railway dashboard
- Use Railway's MongoDB plugin or external MongoDB Atlas

## Common Issues & Solutions

### Issue 1: "Page Not Found" Error
**Cause:** Frontend routing not configured for production
**Solution:** Add this to frontend/package.json:
```json
"homepage": ".",
```

### Issue 2: "CORS Error"
**Cause:** Backend CORS_ORIGINS not set correctly
**Solution:** Set CORS_ORIGINS to your frontend domain:
```
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Issue 3: "Database Connection Failed"
**Cause:** Using localhost MongoDB
**Solution:** Use MongoDB Atlas:
1. Create free cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Set as MONGO_URL environment variable

### Issue 4: "PORT already in use"
**Cause:** Hardcoded port 8001
**Solution:** Platform automatically sets PORT variable, no action needed

## Testing Deployment
1. Test backend: `curl https://your-backend.com/api/`
2. Test frontend: Visit your frontend URL
3. Test auth: Try registering a user
4. Test booking flow: Create a test booking

## Rollback Plan
If deployment fails:
1. Check logs in platform dashboard
2. Verify all environment variables are set
3. Check MongoDB connection string is correct
4. Ensure REACT_APP_BACKEND_URL points to backend
