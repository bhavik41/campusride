# CampusRide

A ride-sharing platform designed for college students — find rides between campuses, split costs, and build community.

## Features

- **Ride Search**: Find rides by city, date, and type
- **Ride Posting**: Drivers can post rides with pricing and seat availability
- **Booking System**: Passengers can book seats and manage their bookings
- **Real-time Chat**: Communicate with drivers/passengers via Socket.io
- **Student Verification**: `.edu` email detection for student badges
- **Dashboard**: Manage all your rides and bookings in one place

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State    | Zustand |
| Backend  | Node.js + Express + TypeScript |
| Database | SQLite via Prisma ORM |
| Realtime | Socket.io |
| Auth     | JWT (jsonwebtoken) + bcryptjs |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/bhavik41/campusride.git
cd campusride

# 2. Install all dependencies
npm run install:all

# 3. Setup database (generate client, push schema, seed data)
npm run db:setup

# 4. Start development servers (in separate terminals)
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:5173
```

## Project Structure

```
campusride/
├── backend/
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── lib/         # Prisma client singleton
│   │   ├── middleware/  # JWT auth middleware
│   │   ├── routes/      # Express route handlers
│   │   ├── index.ts     # Server entry + Socket.io setup
│   │   └── seed.ts      # Database seeder
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page-level components
    │   ├── store/       # Zustand state stores
    │   ├── lib/         # API client & Socket.io client
    │   └── types/       # TypeScript interfaces
    └── package.json
```

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/rides` | List/search rides |
| POST | `/api/rides` | Create a new ride |
| GET  | `/api/rides/:id` | Get ride details |
| POST | `/api/rides/:id/book` | Book a seat |
| GET  | `/api/dashboard/my-rides` | Driver's rides |
| GET  | `/api/dashboard/my-bookings` | Passenger's bookings |
| GET  | `/api/chat/conversations` | List conversations |
| GET  | `/api/chat/conversations/:id/messages` | Get messages |
