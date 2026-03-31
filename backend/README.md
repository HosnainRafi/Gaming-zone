# Gaming Zone Management System (Backend)

## Setup

1. Install deps

```bash
cd backend
npm install
```

2. Configure environment

- Copy `.env.example` to `.env`
- Set `DATABASE_URL` to your PostgreSQL (or MySQL) connection string
- Set `JWT_SECRET` (min 16 chars)

3. Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

4. Run

```bash
npm run dev
```

Health check: `GET /api/health`
