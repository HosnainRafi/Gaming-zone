# Vercel Deployment Guide

## Overview

This project is configured for deployment on Vercel with:

- **Frontend**: React + Vite app (Static hosting)
- **Backend**: Express.js API (Serverless Functions)

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com (free tier works)
2. **GitHub Account**: Your project must be pushed to GitHub
3. **PostgreSQL Database**: Set up a production database (e.g., using Vercel Postgres, Supabase, or Railway)
4. **Vercel CLI** (optional but recommended): `npm install -g vercel`

## Step 1: Set Up Your Database

Choose one of these options:

### Option A: Vercel Postgres (Recommended)

1. Go to https://vercel.com/docs/storage/vercel-postgres/quickstart
2. Create a new Postgres database in your Vercel dashboard
3. Copy the connection string (DATABASE_URL)

### Option B: Supabase

1. Create a free account at https://supabase.com
2. Create a new project
3. Get the connection string from Project Settings > Database > Connection Pooling

### Option C: Railway.app

1. Create an account at https://railway.app
2. Create a new PostgreSQL database
3. Copy the database URL

## Step 2: Deploy Frontend to Vercel

### Method 1: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the `frontend` directory as root
5. Click "Deploy"

### Method 2: Using Vercel CLI

```bash
cd frontend
vercel
# Follow the prompts and select the project folder as: frontend
```

## Step 3: Deploy Backend to Vercel

### Method 1: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository (same one)
4. **Important**: In "Root Directory" → Select `backend` folder
5. Add Environment Variables:
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `JWT_SECRET` = A strong random string (e.g., `openssl rand -base64 32`)
   - `CORS_ORIGIN` = Your frontend URL (e.g., `https://your-frontend.vercel.app`)
   - `NODE_ENV` = `production`
6. Click "Deploy"

### Method 2: Using Vercel CLI

```bash
cd backend
vercel --prod
# Follow the prompts
# Add environment variables when asked
```

## Step 4: Configure Environment Variables

### Backend Environment Variables

In Vercel Backend Project Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<generate-a-strong-secret-key>
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend Environment Variables (if needed)

In Vercel Frontend Project Settings → Environment Variables, add:

```
VITE_API_URL=https://your-backend.vercel.app
```

Then update your frontend API calls to use:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
```

## Step 5: Update API URL in Frontend

Update the frontend's fetch/axios calls to use the backend URL:

**frontend/src/api/axios.ts** (or similar):

```typescript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export default axiosInstance;
```

## Step 6: Test the Deployment

1. **Test Backend**: Visit `https://your-backend.vercel.app/api/health` (if you have a health endpoint)
2. **Test Frontend**: Visit `https://your-frontend.vercel.app`
3. Check browser console for any CORS or API errors
4. Test login and other features

## Troubleshooting

### 1. CORS Errors

- Ensure `CORS_ORIGIN` includes your frontend URL
- Check browser console for exact error message
- Update CORS_ORIGIN to include multiple origins: `https://frontend.vercel.app,https://www.frontend.vercel.app`

### 2. Database Connection Issues

- Verify DATABASE_URL is correct and accessible from Vercel's region
- Check that database IP whitelist allows Vercel's IPs
- Check Vercel build logs for detailed error messages

### 3. Socket.io Connection Issues

- Socket.io required some additional configuration for Vercel Serverless
- For production, consider hosting backend on Railway.app or Render.com instead
- These platforms better support WebSocket connections

### 4. Build Failures

- Check Vercel build logs
- Ensure all environment variables are set
- Make sure TypeScript compiles: `npm run build` locally

## Important Notes

### Socket.io and Vercel

Vercel Serverless Functions have limitations with persistent WebSocket connections. Options:

1. **Keep Socket.io**: Switch backend hosting to Railway.app, Render.com, or similar
2. **Remove Socket.io**: Use polling or server-sent events instead
3. **Hybrid**: Frontend on Vercel, Backend on Railway/Render

To switch backend provider:

```bash
# Railway.app example
npm install -g @railway/cli
railway up
```

### Database Migrations

Run migrations before deployment:

```bash
# Locally
npm run prisma:migrate

# Or after backend deployment, in Vercel logs:
npx prisma migrate deploy
```

## Redeployment

### Automatic (Recommended)

- Just push to GitHub main branch
- Vercel will automatically rebuild and deploy

### Manual

```bash
cd frontend
vercel --prod

cd ../backend
vercel --prod
```

## Useful Vercel Commands

```bash
# List all deployments
vercel list

# View logs
vercel logs

# Pull environment variables locally
vercel env pull

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Next Steps

1. Generate strong JWT_SECRET: `openssl rand -base64 32`
2. Set up your PostgreSQL database
3. Update environment variables
4. Push changes to GitHub if not already done
5. Deploy to Vercel using dashboard or CLI
6. Test all features
7. Monitor logs in Vercel dashboard

Good luck with your deployment! 🚀
