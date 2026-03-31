# Vercel Deployment Checklist

## Pre-Deployment ✅

- [ ] Push all code to GitHub
- [ ] Test local build: `npm run build` in both frontend and backend
- [ ] No build errors in TypeScript or dependencies
- [ ] Create/configure PostgreSQL database
- [ ] Have DATABASE_URL ready
- [ ] Generate JWT_SECRET: `openssl rand -base64 32`

## Frontend Deployment ✅

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New" → "Project"
3. [ ] Select your GitHub repository
4. [ ] Root Directory: **frontend** (or unset if monorepo)
5. [ ] Click "Deploy"
6. [ ] Copy your frontend URL (e.g., `https://my-app.vercel.app`)

## Backend Deployment ✅

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New" → "Project"
3. [ ] Select the same GitHub repository
4. [ ] Root Directory: **backend**
5. [ ] **Environment Variables** (critical!):
   - [ ] `DATABASE_URL` = Your PostgreSQL connection string
   - [ ] `JWT_SECRET` = Generated secret key
   - [ ] `CORS_ORIGIN` = Your frontend URL from above
   - [ ] `NODE_ENV` = `production`
6. [ ] Click "Deploy"
7. [ ] Copy your backend URL (e.g., `https://api-my-app.vercel.app`)

## Post-Deployment ✅

- [ ] Test backend API: Visit `https://your-backend.vercel.app/api`
- [ ] Test frontend: Visit `https://your-frontend.vercel.app`
- [ ] Check browser console for errors
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Test login and core features
- [ ] Monitor Vercel logs for issues

## Update Frontend API URL ✅

If using environment variables:

- [ ] Add `VITE_API_URL` environment variable to frontend Vercel project
- [ ] Update `frontend/src/api/axios.ts` to use `VITE_API_URL`
- [ ] Rebuild frontend

## If Socket.io Doesn't Work ✅

Option 1: Switch backend to Railway.app or Render.com

- [ ] Migrate backend database
- [ ] Update CORS_ORIGIN in frontend to new backend URL

Option 2: Remove Socket.io and use polling instead

- [ ] Refactor WebSocket code to use polling
- [ ] Test functionality

## Monitoring 📊

- [ ] Set up Vercel Analytics
- [ ] Monitor error rates in Vercel dashboard
- [ ] Check database performance
- [ ] Set up backup for PostgreSQL database

## Emergency Commands 🆘

```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Pull environment variables
vercel env pull

# View all deployments
vercel list

# Rollback to previous deployment
# (Use Vercel dashboard → Project Settings → Deployments)
```

## Useful Resources 🔗

- Vercel Docs: https://vercel.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- Socket.io on Vercel: https://socket.io/docs/v4/vercel/
- Express.js Deployment: https://expressjs.com/en/advanced/best-practice-performance.html
