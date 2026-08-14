# Gaming Zone Management System - Project Documentation

## Overview

This is a full-stack web application for managing a gaming zone business. The system allows staff to manage devices, sessions, customers, memberships, offers, and generate reports while providing real-time updates through WebSocket connections.

## Project Structure

### Backend (Node.js/Express/TypeScript)

- **Directory**: `backend/`
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT-based authentication
- **Deployment**: Vercel-ready configuration

### Frontend (React/TypeScript)

- **Directory**: `frontend/`
- **Framework**: React with TypeScript and Vite
- **UI Library**: Tailwind CSS
- **State Management**: Context API, React Hooks
- **Real-time**: Socket.IO client integration

## Key Features

1. **User Management**
   - Staff/ADMIN roles
   - Authentication system with JWT
   - User permissions

2. **Device Management**
   - Device tracking (available, running, maintenance)
   - Hourly rate configuration

3. **Session Management**
   - Real-time session tracking
   - Session status management (active, completed, canceled)
   - Customer session records
   - Membership-based pricing

4. **Customer Management**
   - Customer profiles
   - First-time free claim tracking
   - Session history

5. **Membership System**
   - Membership plans with different durations and prices
   - Membership sales tracking
   - Active membership management

6. **Offer/Discount System**
   - Discount codes with various types (percentage, fixed amount, time-based)
   - Offer expiration management

7. **Reporting & Analytics**
   - Dashboard with real-time metrics
   - Session reports
   - Financial reports

8. **Public Website Features**
   - Game listings (PC, PS4, PS5, etc.)
   - Pricing tiers
   - Slider images for promotions

## Database Schema Overview

The system uses Prisma ORM with PostgreSQL database containing the following models:

### Core Models:

- `User`: Staff/admin users with roles
- `Customer`: Customer profiles
- `MembershipPlan`: Different membership packages
- `Membership`: Active customer memberships
- `MembershipSale`: Records of membership purchases
- `Device`: Gaming devices with status tracking
- `Session`: Session records with pricing details
- `Transaction`: Financial transaction records
- `Offer`: Discount codes and promotions

### Public Website Models:

- `Game`: Game listings for public site
- `PricingTier`: Pricing structures for public site
- `SliderImage`: Image slides for homepage
- `SiteSettings`: Configuration settings

## Technical Stack

### Backend Technologies:

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Security**: Helmet, CORS middleware
- **Logging**: Morgan

### Frontend Technologies:

- **Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **UI Components**: Custom components with Radix UI primitives
- **Real-time**: Socket.IO Client

## Setup Instructions

### Prerequisites:

1. Node.js (v18+)
2. PostgreSQL database
3. npm or yarn package manager

### Backend Setup:

```bash
cd backend
npm install
```

Create `.env` file from `.env.example`:

```bash
# Database URL (update with your PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/gaming_zone?schema=public"

# JWT Secret (minimum 16 characters)
JWT_SECRET="your-super-secret-jwt-key-here"

# CORS Origin (for development)
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

Initialize database:

```bash
npx prisma generate
npx prisma migrate dev
```

Run development server:

```bash
npm run dev
```

### Frontend Setup:

```bash
cd frontend
npm install
```

Create `.env.local` file:

```bash
# Base URL for backend API
VITE_API_BASE_URL="http://localhost:8000"
```

Run development server:

```bash
npm run dev
```

## API Endpoints

### Authentication:

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Devices:

- `GET /api/devices` - List all devices
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Sessions:

- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Customers:

- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Memberships:

- `GET /api/memberships` - List memberships
- `POST /api/memberships` - Create membership
- `PUT /api/memberships/:id` - Update membership

### Offers:

- `GET /api/offers` - List offers
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

### Reports:

- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/sessions` - Session reports
- `GET /api/reports/financial` - Financial reports

### Public Site:

- `GET /api/games` - List public games
- `GET /api/pricing` - Pricing information
- `GET /api/slider` - Slider images
- `GET /api/settings` - Site settings

## Real-time Features

The application uses Socket.IO for real-time updates including:

- Live session status updates
- Device availability notifications
- Active sessions monitoring
- Dashboard data synchronization

## Deployment Configuration

### Backend Vercel Deployment:

The project includes `vercel.json` configuration for easy deployment to Vercel.

### Environment Variables:

Required environment variables in `.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

## Development Guidelines

1. **Database Migrations**:
   - Always run `npx prisma migrate dev` after schema changes
   - Use `npx prisma generate` to update client after schema changes

2. **API Design**:
   - RESTful endpoints with proper HTTP status codes
   - Consistent response structure across all APIs
   - Input validation using Zod schemas

3. **Frontend Architecture**:
   - Component-based structure with React hooks
   - Context API for global state management
   - Route-based page organization
   - Responsive design with Tailwind CSS

4. **Code Quality**:
   - TypeScript for type safety
   - Consistent code formatting (Prettier)
   - Comprehensive error handling
   - Logging of important operations

## Security Considerations

1. **Authentication**: JWT tokens with secure signing
2. **Authorization**: Role-based access control
3. **Input Validation**: Zod schema validation for all inputs
4. **Database Security**: Prisma ORM prevents SQL injection
5. **CORS**: Configurable CORS settings
6. **Rate Limiting**: Not implemented but can be added

## Performance Optimization

1. **Database Indexes**: Proper indexing on frequently queried fields
2. **API Caching**: Response caching for read-heavy endpoints
3. **Frontend Bundle Optimization**: Vite build optimizations
4. **Real-time Updates**: Efficient Socket.IO usage with proper disconnection handling

## Testing Strategy

While not explicitly mentioned, the system structure suggests:

1. Unit tests for business logic services
2. Integration tests for API endpoints
3. End-to-end tests for frontend components
4. Database tests for schema and relationships

## Future Enhancements

1. Mobile app integration
2. Advanced reporting with data visualization
3. SMS/email notifications
4. Advanced analytics dashboard
5. Inventory management system
6. Staff scheduling system
7. Loyalty program features

## Project Files Overview

### Backend:

- `src/app.ts`: Main Express application setup
- `src/server.ts`: Server entry point with HTTP and Socket.IO initialization
- `src/config/env.ts`: Environment configuration
- `src/controllers/`: API controllers handling business logic
- `src/services/`: Business logic services
- `src/models/`: Database models (Prisma schema)
- `src/routes/`: API routing definitions
- `src/middlewares/`: Middleware functions
- `src/socket/`: Socket.IO connection handling

### Frontend:

- `src/App.tsx`: Main application component with routing
- `src/pages/`: Page components for different views
- `src/components/`: Reusable UI components
- `src/context/`: React Context providers
- `src/api/`: API client functions
- `src/hooks/`: Custom React hooks

## Troubleshooting

1. **Database Connection Issues**:
   - Verify `DATABASE_URL` in `.env` file is correct
   - Ensure PostgreSQL server is running
   - Run `npx prisma migrate dev` to initialize database

2. **JWT Errors**:
   - Check that `JWT_SECRET` is at least 16 characters long
   - Verify tokens are properly stored and sent with requests

3. **Socket.IO Issues**:
   - Ensure backend server is running on the correct port
   - Check network connectivity between frontend and backend

4. **Build Errors**:
   - Run `npm install` in both frontend and backend directories
   - Clear node_modules and reinstall dependencies if needed
