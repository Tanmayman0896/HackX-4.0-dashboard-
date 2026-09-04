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
│   │   │   ├── login/, admin/, judge/, mentor/, team/, super-admin/   # Role routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx     # Redirects root / to /login
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

Visit [http://localhost:3000](http://localhost:3000) to access the Dashboard (redirects to `/login`).

---

## 🐳 Docker Deployment

Everything is configured from a single `.env` file next to `docker-compose.yml`:

```bash
cp .env.example .env   # then set POSTGRES_PASSWORD, JWT_SECRET and the public URLs
docker compose up -d --build
```

This starts PostgreSQL (data in the `db_data` volume), the backend (which runs
`prisma migrate deploy` on start) and the frontend. All three bind to
`127.0.0.1` only; put a reverse proxy in front of them. The production host
runs nginx with TLS from Let's Encrypt and routes:

| Path     | Upstream                |
|----------|-------------------------|
| `/api/`  | backend, port 5000      |
| `/ws`    | backend WebSocket, 9000 |
| `/`      | frontend, port 3000     |

`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are baked into the frontend
image at build time, so rebuild the frontend after changing them.

To redeploy after pushing to `main`:

```bash
cd ~/HackX4Dashboard && git pull && docker compose up -d --build
```
