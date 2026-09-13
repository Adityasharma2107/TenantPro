# TenantPro

[![CI Status](https://github.com/Adityasharma2107/TenantPro/actions/workflows/ci.yml/badge.svg)](https://github.com/Adityasharma2107/TenantPro/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0%20%7C%206.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-green?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socketdotio)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary)](https://cloudinary.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-yellow?logo=vitest)](https://vitest.dev/)

**TenantPro** is an enterprise-grade, multi-role tenant complaint and property maintenance management platform designed for apartment complexes, student housing, and residential communities. 

Engineered with a strong emphasis on **system architecture**, **multi-tenant data isolation**, **strict server-side RBAC**, **real-time synchronization**, and **security hardening**.

---

## 🏛️ System Architecture

```text
                               ┌─────────────────────────────────────────┐
                               │           React 19 Frontend             │
                               │  Vite • Tailwind CSS • React Query v5   │
                               └────────────────────┬────────────────────┘
                                                    │
                                     HTTPS / WSS    │  HTTP-Only JWT Cookies
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │           Express 5 API Server          │
                               │  Helmet • Rate Limiting • Zod • RBAC    │
                               └──────┬──────────────────────┬───────────┘
                                      │                      │
                   Real-Time Events   │                      │   Mongoose ODM
                                      ▼                      ▼
                        ┌───────────────────┐      ┌───────────────────┐
                        │     Socket.io     │      │   MongoDB Atlas   │
                        │ Property-Scoped   │      │ Multi-Tenant Data │
                        │  Virtual Rooms    │      │  Indexed Models   │
                        └───────────────────┘      └───────────────────┘
                                      │
                                      ▼
                        ┌───────────────────┐
                        │    Cloudinary     │
                        │ Image Attachments │
                        └───────────────────┘
```

---

## 🚀 Key Architectural Features

### 1. Multi-Tenant Role-Based Access Control (RBAC) & IDOR Protection
* **Tenant Isolation**: Every ticket, comment, and team member is bound to an authenticated user's `propertyId`.
* **Zero Trust Server-Side Verification**: Route parameters are strictly cross-checked against session credentials. Changing an ID in an API request returns `403 Forbidden` or `404 Not Found` (verified by automated integration tests).
* **Persona Separation**:
  * **Tenants**: Create issues with auto-priority rules, upload photos, track resolution timeline, post comments.
  * **Property Managers**: Full property dashboard, technician assignment dispatch, resident directory, technician roster, and operational turnaround analytics.
  * **Technicians**: View assigned maintenance backlog, update repair states (`in_progress` → `resolved`), attach notes, track turnaround time.

### 2. Real-Time Synchronization via Socket.io
* **Handshake Authentication**: Socket connections authenticate using HTTP-only JWT cookies parsed directly from handshake headers.
* **Virtual Room Segregation**: Sockets join property-isolated rooms (`property:${propertyId}`) and private user rooms (`user:${userId}`).
* **Cache Invalidation**: Client hooks capture WebSocket dispatches (`ticket:created`, `ticket:status_changed`, `ticket:assigned`, `ticket:comment_added`) and automatically invalidate React Query caches for real-time reactivity without manual refresh.

### 3. File Attachments Pipeline
* Multi-file photo dropzone powered by Multer and Cloudinary CDN.
* File type restrictions (JPG, PNG, WebP, GIF), 5MB size limit, and automatic offline development fallback.
* Responsive image gallery with modal lightbox preview.

### 4. Operational Intelligence & Analytics
* Turnaround speed metrics calculating average resolution hours across completed repairs.
* Property health score indicating repair resolution velocity.
* Real-time category breakdown and technician efficiency dispatch leaderboard.

### 5. Security Hardening
* **JWT in HTTP-Only Cookies**: Immune to client-side XSS token theft. Automatically adapts between `SameSite=Lax` (local/Docker) and `SameSite=None; Secure=true` (decoupled cloud production).
* **Rate Limiting**: Multi-tiered rate limiters protecting against denial of service and brute force.
* **HTTP Security Headers**: Helmet configured with cross-origin resource sharing policies for media rendering.
* **Password Hashing**: Salted bcrypt password hashing with minimum entropy requirements.

---

## 💻 Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | React Router v7, TanStack Query v5, Tailwind CSS v4, Lucide Icons |
| **Backend** | Node.js 24, Express 5, TypeScript | RESTful APIs, Zod v4 validation, Helmet, CORS, Express Rate Limit |
| **Real-Time** | Socket.io 4.8 | Handshake cookie auth, property virtual rooms, bidirectional dispatch |
| **Database** | MongoDB Atlas, Mongoose 9 | Multi-tenant schema design, compound indexing, audit logging |
| **Storage** | Cloudinary API, Multer | Media pipeline, CDN delivery, thumbnail transformation |
| **Testing** | Vitest 5, Supertest 7, RTL | ESM-native integration testing, RBAC & IDOR security suites |
| **DevOps** | Docker, Nginx, GitHub Actions | Multi-stage Dockerfiles, Docker Compose, automated CI pipeline |

---

## 📡 Real-Time Socket.io Events

| Event Name | Scope / Target Room | Triggered When | Payload |
| :--- | :--- | :--- | :--- |
| `ticket:created` | `property:${propertyId}` | Tenant submits a new ticket | `{ ticket: ITicket }` |
| `ticket:updated` | `property:${propertyId}` | Status updated or technician assigned | `{ ticket: ITicket }` |
| `ticket:assigned` | `user:${technicianId}` | Manager assigns repair to technician | `{ ticket: ITicket }` |
| `ticket:comment_added` | `property:${propertyId}` | Discussion comment posted | `{ ticketId, comment: IComment }` |

---

## 📋 REST API Specification

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Onboard property manager and create residential property.
* `POST /api/auth/login` — Authenticate user and issue HTTP-only JWT cookie.
* `GET /api/auth/me` — Retrieve active session profile.
* `POST /api/auth/logout` — Clear authentication cookie.

### Team Management (`/api/team`)
* `POST /api/team` — Add resident (with unit number) or technician (with trade skills) *(Manager only)*.
* `GET /api/team/residents` — List all registered residents for property *(Manager only)*.
* `GET /api/team/technicians` — List technicians and active ticket workloads.

### Tickets Workflow (`/api/tickets`)
* `GET /api/tickets` — List tickets scoped by caller's role (Tenant: own; Manager: property; Technician: assigned).
* `POST /api/tickets` — Submit maintenance ticket with category priority rules *(Tenant only)*.
* `GET /api/tickets/:ticketId` — Detailed ticket view with comments, attachments, and audit timeline.
* `PATCH /api/tickets/:ticketId/assignment` — Assign technician *(Manager only)*.
* `PATCH /api/tickets/:ticketId/priority` — Update repair priority *(Manager only)*.
* `PATCH /api/tickets/:ticketId/status` — Advance ticket lifecycle (`open` → `assigned` → `in_progress` → `resolved` → `closed`).
* `POST /api/tickets/:ticketId/comments` — Post message to discussion thread.

### Media & Analytics
* `POST /api/upload` — Upload up to 5 ticket photo attachments.
* `GET /api/analytics` — Resolution turnaround times, category stats, and leaderboard *(Manager only)*.

---

## 🧪 Testing & Quality Assurance

TenantPro includes an automated integration test suite written with **Vitest** and **Supertest**:

```bash
# Run all automated tests across workspace
pnpm test

# Run backend integration tests only
pnpm --filter tenantpro-server test

# Run frontend component tests only
pnpm --filter tenantpro-client test
```

### Key Test Suites:
* **Authentication Suite** (`server/src/__tests__/auth.test.ts`): Tests registration, bcrypt hashing, credential validation, HTTP-only cookie setting, session recovery, and logout.
* **RBAC & Cross-Tenant Security Suite** (`server/src/__tests__/rbac-isolation.test.ts`): Tests IDOR prevention across separate properties, cross-tenant status modification barriers, and role restrictions.
* **Ticket Lifecycle Suite** (`server/src/__tests__/ticket-workflow.test.ts`): Tests priority rules, technician dispatch, resolution timestamp tracking, discussion threads, and operational analytics.
* **Client UI Suite** (`client/src/__tests__/components.test.tsx`): Tests status badges, priority tags, and metric cards.

---

## 🐳 Running with Docker

You can run the entire TenantPro stack (MongoDB, Express API, and Nginx-powered React client) with a single command:

```bash
# Clone the repository
git clone https://github.com/Adityasharma2107/TenantPro.git
cd TenantPro

# Start all services with Docker Compose
docker compose up --build
```

* **Client Web App**: `http://localhost:3000`
* **API Backend**: `http://localhost:5000`
* **MongoDB Database**: `mongodb://localhost:27017`

---

## 🛠️ Local Development Setup

### Prerequisites
* **Node.js**: v22+ (tested on v24)
* **pnpm**: v11+
* **MongoDB**: Atlas connection string or local MongoDB instance

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment Variables
Copy the environment examples:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```
Fill in your `MONGODB_URI` and `JWT_SECRET` in `server/.env`.

### Step 3: Start Development Servers
In separate terminals:
```bash
# Terminal 1: Start Express API server (port 5000)
pnpm dev:server

# Terminal 2: Start React Vite client (port 5173)
pnpm dev:client
```

Visit `http://localhost:5173` to interact with TenantPro.

---

## 🌐 Production Deployment Guide

### Recommended Stack: Render (Backend) + Vercel (Frontend)

#### 1. Backend on Render (Web Service)
1. Link your GitHub repository in the [Render Dashboard](https://dashboard.render.com/).
2. Select **Web Service**, runtime **Node**.
3. Set **Root Directory**: `server`
4. Set **Build Command**: `pnpm install`
5. Set **Start Command**: `pnpm start`
6. Add Environment Variables:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `CLIENT_URL`: `https://your-app.vercel.app`
   * `MONGODB_URI`: `mongodb+srv://...`
   * `JWT_SECRET`: *(secure 32+ character random string)*
   * `COOKIE_SAME_SITE`: `none` *(enables cross-domain credentials)*
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

#### 2. Frontend on Vercel
1. Import repository in the [Vercel Dashboard](https://vercel.com/).
2. Set **Root Directory**: `client`
3. Framework Preset: **Vite**
4. Add Environment Variables:
   * `VITE_API_BASE_URL`: `https://your-tenantpro-api.onrender.com`
   * `VITE_SOCKET_URL`: `https://your-tenantpro-api.onrender.com`
5. Deploy!

---

## 📅 14-Day Engineering Roadmap Status

- [x] **Day 1**: React + Vite client scaffold, Express server scaffold, and health check
- [x] **Day 2**: MongoDB Atlas integration, Mongoose schemas, and strict data models
- [x] **Day 3**: Manager registration, JWT cookie authentication, and role middleware
- [x] **Day 4**: Team management APIs and ticket CRUD operations
- [x] **Day 5**: Ticket workflow backend, technician assignments, and activity logs
- [x] **Day 6**: Tenant dashboard UI, ticket submission modal, and React Query data integration
- [x] **Day 7**: Ticket detail view, category priority logic, status stepper, and audit history
- [x] **Day 8**: Resident directory, technician roster, and team member onboarding
- [x] **Day 9–10**: Real-time Socket.io updates with cookie auth and virtual property rooms
- [x] **Day 11**: Cloudinary media attachments pipeline with dropzone and image lightbox
- [x] **Day 12**: Operational analytics dashboard, rate limiting, and security hardening
- [x] **Day 13**: Automated integration test suites (Vitest + Supertest), Dockerization, and CI pipeline
- [x] **Day 14**: Cross-domain deployment configuration, environment templates, and flagship documentation

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
