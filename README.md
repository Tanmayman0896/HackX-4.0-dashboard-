# HackX 3.0 System (Backend API & Frontend Dashboard)

Production-ready hackathon management platform consisting of an **Express.js & TypeScript Backend API** (with PostgreSQL / Prisma ORM and real-time WebSockets) and a **Next.js Frontend Dashboard** (supporting Admin, Judge, Mentor, Team/Participant, and Super-Admin roles).

---

## 🛠️ Technology Stack

### Backend
- **Framework & Language**: Node.js, Express.js, TypeScript (`tsx`)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Real-Time Messaging**: WebSocket (`ws`)
- **Security & Auth**: JWT, bcryptjs, Helmet, CORS

### Frontend (Dashboard)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Shadcn UI
- **State & Data**: React Hooks, WebSocket client integration

---

## 📂 Project Structure

```text
.
├── backend/                  # REST API & WebSocket server
│   ├── middleware/           # Auth, logging & error handlers
│   ├── prisma/               # Database schema & migrations
│   ├── routes/               # Express API endpoints
│   ├── services/             # Core business logic
│   ├── server.ts             # Server entrypoint
│   └── Dockerfile
├── frontend/                 # Dashboard web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/   # Admin, Judge, Mentor, Team, Super-Admin routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx     # Redirects root / to /dashboard/login
│   │   └── components/
│   │       ├── admin/
│   │       ├── auth/
│   │       ├── layout/
│   │       ├── mentor/
│   │       ├── participant/
│   │       ├── super-admin/
│   │       └── ui/          # UI Component Library
│   └── Dockerfile
├── docker-compose.yml        # Docker Compose (PostgreSQL, Backend, Frontend)
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install

# Database setup
npm run db:generate
npm run db:push

# Start development server (Port 4000 & WebSocket Port 9000)
npm run dev
```

### 2. Frontend Dashboard Setup

```bash
cd frontend
npm install

# Start Next.js development server (Port 3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the Dashboard (redirects to `/dashboard/login`).

---

## 🐳 Docker Deployment

To spin up the database, backend, and frontend dashboard with Docker Compose:

```bash
docker compose up -d --build
```
