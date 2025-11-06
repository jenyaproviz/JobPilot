# JobPilot Deployment Guide

## Deployment Architecture
- **Client**: Deployed on Vercel (React + Vite)
- **Server**: Deployed on Render (Node.js + Express)
- **Database**: MongoDB Atlas (recommended)

## 🚀 Client Deployment (Vercel)

### Step 1: Deploy Client to Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Select the `client` folder as the root directory
4. Framework preset will be automatically detected as "Vite"
5. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 2: Environment Variables in Vercel
Add these environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-render-app-name.onrender.com/api
```

## 🖥️ Server Deployment (Render)

### Step 1: Deploy Server to Render
1. Go to [Render](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: job-pilot-server
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`

### Step 2: Environment Variables in Render
Add these environment variables in Render dashboard:

#### Required Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobpilot
JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
CLIENT_URL=https://your-vercel-app-name.vercel.app
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_RECEIVER=your-email@gmail.com
```

## 📊 Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string
5. Add your Render IP addresses to whitelist (or use 0.0.0.0/0 for development)

## 🔗 Connecting Client and Server

### Step 1: Update URLs
After both deployments:

1. **Update client environment**:
   - In Vercel dashboard, update `VITE_API_URL` with your Render server URL
   
2. **Update server environment**:
   - In Render dashboard, update `CLIENT_URL` with your Vercel client URL

### Step 2: Test the Connection
1. Visit your Vercel client URL
2. Check browser network tab for API calls
3. Verify server health at: `https://your-render-app.onrender.com/api/health`

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CLIENT_URL` in server matches your Vercel URL
2. **API Not Found**: Verify `VITE_API_URL` in client points to correct Render URL
3. **Build Failures**: Check build logs in respective platforms
4. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist

### Useful Commands:
```bash
# Test local client build
cd client
npm run build

# Test local server build  
cd server
npm run build
npm start
```

## 📝 Post-Deployment Checklist

- [ ] Client builds successfully on Vercel
- [ ] Server builds and starts successfully on Render  
- [ ] Database connects to MongoDB Atlas
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] API endpoints return expected responses
- [ ] Client can communicate with server
- [ ] Contact form works (if using email features)
- [ ] Job search functionality works

## 🔄 Continuous Deployment

Both Vercel and Render will automatically redeploy when you push changes to your GitHub repository:
- **Vercel**: Redeploys client on pushes to main branch
- **Render**: Redeploys server on pushes to main branch

Make sure to test locally before pushing to production!