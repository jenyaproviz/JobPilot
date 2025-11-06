# Render Deployment Checklist for JobPilot Server

## 🚀 Render Configuration

### Basic Settings:
- **Service Name**: job-pilot-server
- **Environment**: Node
- **Region**: US East (or closest to you)
- **Branch**: main
- **Root Directory**: server ⚠️ CRITICAL: Must be "server"

### Build & Deploy Settings:
- **Runtime**: Node (auto-detected)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## 🔐 Required Environment Variables

### Essential (Required for basic functionality):
```
NODE_ENV=production
CLIENT_URL=https://job-pilot-client.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobpilot
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
```

### Optional (for enhanced features):
```
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_RECEIVER=your-email@gmail.com
```

## 📊 MongoDB Setup Options

### Option 1: MongoDB Atlas (Recommended)
1. Go to: https://www.mongodb.com/atlas
2. Create free account
3. Create free cluster (M0 Sandbox)
4. Create database user
5. Get connection string
6. Replace <username>, <password>, and <database> in the string

### Option 2: Temporary Local (for testing)
```
MONGODB_URI=mongodb://localhost:27017/jobpilot
```

## ✅ Deployment Steps

1. ✅ Go to render.com
2. ✅ Sign in with GitHub
3. ✅ Click "New +" → "Web Service"
4. ✅ Connect GitHub repository (JobPilot)
5. ✅ Configure settings above
6. ✅ Add environment variables
7. ✅ Click "Create Web Service"
8. ✅ Wait for deployment (5-10 minutes)

## 🔗 After Deployment

1. Get your Render URL: `https://job-pilot-server-xxx.onrender.com`
2. Update Vercel environment variable:
   - `VITE_API_URL` = `https://job-pilot-server-xxx.onrender.com/api`
3. Test the connection!

## 🚨 Common Issues

- **Build fails**: Check that Root Directory is set to "server"
- **Database connection fails**: Verify MongoDB URI format
- **CORS errors**: Make sure CLIENT_URL matches your Vercel URL exactly