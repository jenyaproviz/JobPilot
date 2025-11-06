# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist
- [x] Client builds successfully locally
- [x] Environment variables configured
- [x] Repository is clean and pushed to GitHub

## 🚀 Vercel Deployment Steps

### 1. Vercel Dashboard
- Go to: https://vercel.com
- Sign in with GitHub account

### 2. Import Project
- Click "New Project"
- Import "jenyaproviz/JobPilot" repository

### 3. Configuration Settings
- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: client ⚠️ IMPORTANT: Select "client" folder
- **Build Command**: npm run build
- **Output Directory**: dist
- **Install Command**: npm install

### 4. Environment Variables
Add these in Vercel dashboard:

```
VITE_API_URL = https://your-render-app-name.onrender.com/api
```

⚠️ **TEMPORARY**: For initial deployment, use: http://localhost:5000/api
(Update this after deploying the server to Render)

### 5. Deploy
- Click "Deploy" button
- Wait for build completion (1-3 minutes)

## 📝 Post-Deployment

### Your Vercel URLs will be:
- **Production**: https://job-pilot-client-[random].vercel.app
- **Preview**: Generated for each Git push

### Next Steps:
1. ✅ Deploy client to Vercel (this step)
2. ⏳ Deploy server to Render 
3. ⏳ Update VITE_API_URL in Vercel with Render URL
4. ⏳ Update CLIENT_URL in Render with Vercel URL
5. ⏳ Test full application

## 🔧 Troubleshooting

### Common Issues:
- **Build fails**: Check client/package.json and dependencies
- **Blank page**: Check browser console for API errors
- **API errors**: Verify VITE_API_URL environment variable

### Build Commands Reference:
```bash
# Local test build
cd client
npm run build

# Local test serve
npm run preview
```

## 📞 Support Links
- Vercel Docs: https://vercel.com/docs
- JobPilot Deployment Guide: ./DEPLOYMENT.md