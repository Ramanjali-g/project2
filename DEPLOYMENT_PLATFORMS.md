# Endless Path - Multi-Platform Deployment Guide

## ⚠️ CRITICAL: Issues Fixed for External Deployment

The following issues that cause "Page Not Found" and errors on external platforms have been **FIXED**:

### ✅ Issues Resolved:
1. **Dynamic PORT Support** - Backend now reads PORT from environment (Render/Railway auto-set this)
2. **React Router 404 Fix** - Added `_redirects` and `.htaccess` for SPA routing
3. **MongoDB Localhost** - Documentation added for MongoDB Atlas connection
4. **Static File Serving** - Added `serve` package for production frontend
5. **CORS Configuration** - Can be set per environment
6. **Build Configuration** - `homepage: "."` added to package.json

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Render.com (RECOMMENDED - Easiest)

**Why Render?**
- Free tier available
- Auto-detects Python & Node
- Built-in MongoDB support via add-ons
- One-click deploy with `render.yaml`

**Steps:**

1. **Create MongoDB Database** (Choose one):
   - Use Render's MongoDB add-on, OR
   - Use MongoDB Atlas (free tier): https://mongodb.com/cloud/atlas

2. **Deploy Backend:**
   ```
   - New Web Service
   - Connect your GitHub repo
   - Root Directory: backend
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

3. **Add Environment Variables:**
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/endless_path
   DB_NAME=endless_path_production
   JWT_SECRET_KEY=your-random-secret-key-min-32-chars
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   CORS_ORIGINS=https://your-frontend.onrender.com
   ```

4. **Deploy Frontend:**
   ```
   - New Static Site
   - Root Directory: frontend
   - Build Command: yarn install && yarn build
   - Publish Directory: frontend/build
   ```

5. **Frontend Environment Variable:**
   ```
   REACT_APP_BACKEND_URL=https://your-backend.onrender.com
   ```

**✅ DONE!** Your site will be live at:
- Backend: `https://endless-path-backend.onrender.com`
- Frontend: `https://endless-path-frontend.onrender.com`

---

### Option 2: Railway.app

**Steps:**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   railway up
   ```
   Set environment variables in Railway dashboard

3. **Deploy Frontend:**
   ```bash
   cd frontend
   railway up
   ```

**Environment Variables:** Same as Render

---

### Option 3: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
cd frontend
vercel
```

Add environment variable in Vercel dashboard:
```
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

**Backend on Render:** Follow Option 1 backend steps

---

### Option 4: Heroku

**Backend:**
```bash
cd backend
heroku create endless-path-backend
git subtree push --prefix backend heroku main
heroku addons:create mongolab:sandbox
```

**Frontend:**
```bash
cd frontend
heroku create endless-path-frontend
heroku buildpacks:add heroku/nodejs
git subtree push --prefix frontend heroku main
```

---

## 🔧 COMMON DEPLOYMENT ERRORS & FIXES

### Error 1: "Application Error" or "Page Not Found"

**Causes & Solutions:**

1. **Wrong Build/Start Commands**
   - ✅ Backend: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - ✅ Frontend: `yarn install && yarn build` (build), `npx serve -s build -p $PORT` (start)

2. **Missing Environment Variables**
   - Check all variables are set in platform dashboard
   - Verify `REACT_APP_BACKEND_URL` has no trailing slash

3. **React Router 404s**
   - ✅ FIXED: `_redirects` file added to `/public`
   - For custom domains: Configure platform to serve `index.html` for all routes

---

### Error 2: "CORS Policy Error"

**Solution:**
```
Backend .env:
CORS_ORIGINS=https://your-frontend-url.com
```

Don't use `*` in production unless you want public API access.

---

### Error 3: "Database Connection Failed"

**Solutions:**

1. **Get MongoDB Atlas connection string:**
   - Go to mongodb.com/cloud/atlas
   - Create free cluster
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Set as `MONGO_URL` environment variable

2. **Example connection string:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/endless_path?retryWrites=true&w=majority
   ```

---

### Error 4: "Cannot find module 'razorpay'"

**Solution:**
Ensure `requirements.txt` includes all dependencies:
```bash
cd backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update dependencies"
```

---

### Error 5: "Blank Page / White Screen"

**Causes & Solutions:**

1. **Wrong REACT_APP_BACKEND_URL**
   - Must start with `https://`
   - No trailing slash
   - Example: `https://endless-path-backend.onrender.com`

2. **Build not created**
   - Run: `cd frontend && yarn build`
   - Check `frontend/build` folder exists

3. **Check browser console for errors** (F12)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying to ANY platform:

- [ ] MongoDB Atlas cluster created (or platform MongoDB add-on)
- [ ] Get MongoDB connection string
- [ ] Get Razorpay LIVE keys (not test keys)
- [ ] Generate secure JWT_SECRET_KEY (32+ characters)
- [ ] List all domains for CORS_ORIGINS
- [ ] Test locally with production environment variables
- [ ] Update `REACT_APP_BACKEND_URL` to production backend URL

---

## 🧪 TESTING YOUR DEPLOYMENT

After deployment, test these critical flows:

1. **Backend Health:**
   ```bash
   curl https://your-backend.com/api/
   # Should return: {"message":"Endless Path API","status":"running"}
   ```

2. **Customer Registration:**
   - Go to your frontend URL
   - Click "Register" → Choose "Customer"
   - Create account → Should show 5 credits

3. **Service Browsing:**
   - Browse services → Should show 12 categories
   - Search for "repair" → Should find services

4. **Complete Booking Flow:**
   - Login as customer → Book a service → Credits deducted
   - Login as provider → Accept booking → Mark complete
   - Login as customer → Leave review

---

## 🆘 STILL HAVING ISSUES?

1. **Check platform logs:**
   - Render: Go to service → "Logs" tab
   - Vercel: Deployment → "Function Logs"
   - Railway: Project → "Deployments" → Click deployment

2. **Common log errors:**
   - "Module not found" → Check requirements.txt/package.json
   - "Connection refused" → Check MongoDB URL
   - "CORS error" → Check CORS_ORIGINS matches frontend URL

3. **Test environment variables:**
   ```bash
   # In platform terminal/shell
   echo $MONGO_URL
   echo $REACT_APP_BACKEND_URL
   ```

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:
- ✅ Backend URL returns API status
- ✅ Frontend loads without blank page
- ✅ You can register a new user
- ✅ Services page shows 12 categories
- ✅ Booking flow works end-to-end
- ✅ No CORS errors in browser console

---

## 📞 PLATFORM-SPECIFIC SUPPORT

- **Render:** https://render.com/docs
- **Railway:** https://docs.railway.app
- **Vercel:** https://vercel.com/docs
- **Heroku:** https://devcenter.heroku.com

---

**Built with ❤️ on Emergent.sh**
