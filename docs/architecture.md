# TenantPro Architecture & System Design

This document outlines the system architecture, security framework, data models, real-time communication patterns, and deployment topologies implemented in **TenantPro**.

---

## 1. High-Level Architectural Topology

```text
[Client Layer]
  React 19 SPA (Vite, Tailwind CSS, TanStack Query v5)
       │
       │ HTTPS REST APIs
       │ WSS WebSockets (Socket.io)
       ▼
[Edge / Network Layer]
  Nginx Reverse Proxy (Docker) / Cloudflare Edge (Vercel)
       │
       │ HTTP-Only Cookie Handshake
       ▼
[Application Services Layer]
  Node.js / Express 5 API Service
  ├── Security & Middlewares: Helmet, Rate Limiter, Cookie Parser, CORS
  ├── Auth & RBAC Engine: JWT Verification, Role Guard, Property Scope Enforcer
  ├── Business Domain Controllers: Auth, Team, Tickets, Upload, Analytics
  └── Real-Time Dispatcher: Socket.io Server (Property Rooms: `property:${id}`)
       │
       ├── MongoDB Atlas (Mongoose ODM - Primary Multi-Tenant Datastore)
       └── Cloudinary API (Media & Ticket Attachment CDN)
```

---

## 2. Multi-Tenancy & Data Isolation Model

TenantPro utilizes a **Logical Multi-Tenancy Architecture** via property scoping:

* **Property as Tenant Boundary**: Every user account (`User`) and complaint ticket (`Ticket`) contains an indexed reference to a `Property`.
* **Zero Trust Token Payload**: When a user logs in, their issued JWT contains their `sub` (User ID), `role`, and `propertyId`.
* **Server-Side Enforcement**: API controllers never rely on client-submitted `propertyId` fields in the request body. All database queries and filters automatically inject `user.propertyId` derived directly from the verified cryptographic token:
  ```ts
  // Guaranteed boundary enforcement
  const filter: QueryFilter<ITicket> = { property: request.user!.propertyId };
  ```
* **IDOR Protection**: In detail routes (`GET /api/tickets/:ticketId`, `PATCH /api/tickets/:ticketId/status`), the controller validates both property ownership and role permissions:
  ```ts
  const canAccessTicket = (ticket: ITicket, user: AuthenticatedUser): boolean => {
    if (user.role === 'manager') return isSameId(ticket.property, user.propertyId);
    if (user.role === 'tenant') return isSameId(ticket.tenant, user.userId);
    return isSameId(ticket.assignedTechnician, user.userId);
  };
  ```

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource & Operation | Tenant | Manager | Technician | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/register` (Manager + Property) | ❌ | ❌ | ❌ | ✅ |
| `POST /api/auth/login` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/auth/me` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/team` (Add Resident / Technician) | ❌ | ✅ | ❌ | ❌ |
| `GET /api/team/residents` | ❌ | ✅ | ❌ | ❌ |
| `GET /api/team/technicians` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/tickets` (Create Ticket) | ✅ | ❌ | ❌ | ❌ |
| `GET /api/tickets` (List Tickets) | Own Only | Property-Wide | Assigned Only | ❌ |
| `GET /api/tickets/:id` (View Details) | Own Only | Property-Wide | Assigned Only | ❌ |
| `PATCH /api/tickets/:id/assignment` | ❌ | ✅ | ❌ | ❌ |
| `PATCH /api/tickets/:id/priority` | ❌ | ✅ | ❌ | ❌ |
| `PATCH /api/tickets/:id/status` | Close Own | Full Control | In-Progress / Resolve | ❌ |
| `POST /api/tickets/:id/comments` | Permitted | Permitted | Permitted | ❌ |
| `POST /api/upload` (Attachments) | ✅ | ✅ | ✅ | ❌ |
| `GET /api/analytics` | ❌ | ✅ | ❌ | ❌ |

---

## 4. Authentication & Session Architecture

1. **Password Hashing**: Passwords are encrypted with `bcryptjs` using 12 salt rounds before database persistence. Password hashes are marked with `select: false` in Mongoose to prevent accidental exposure.
2. **HTTP-Only Cookies**:
   * Token name: `tenantpro_access_token`
   * Flags: `httpOnly: true`, `secure: isProduction`, `sameSite: isProduction ? 'none' : 'lax'`.
   * Completely immune to client-side XSS attacks (cannot be read via `document.cookie`).
3. **Cross-Domain Adaptation**:
   * For local development or Docker (`client` and `server` on localhost), `SameSite=Lax` avoids cross-site flags.
   * For decoupled cloud hosting (`tenantpro.vercel.app` calling `tenantpro-api.onrender.com`), the cookie automatically switches to `SameSite=None; Secure=true`, allowing cross-origin credential transmission.

---

## 5. Real-Time WebSocket Topology (Socket.io)

### Handshake Authentication
Unlike insecure implementations that pass JWTs via query parameters or unauthenticated connections, TenantPro extracts and verifies the HTTP-only cookie during the WebSocket upgrade handshake:

```ts
io.use((socket, next) => {
  const rawCookie = socket.handshake.headers.cookie;
  const parsed = parseCookie(rawCookie);
  const token = parsed[AUTH_COOKIE_NAME];
  const user = verifyAccessToken(token);
  socket.data.user = user;
  next();
});
```

### Room Isolation
* Upon connection, each socket joins:
  1. `property:${user.propertyId}` — multi-tenant channel for property-level events.
  2. `user:${user.userId}` — direct channel for private technician notifications.
* When a ticket is updated or a comment is posted, events are broadcast **strictly to the property room**, preventing cross-tenant leakage.

### Frontend Cache Invalidation Strategy
The React client uses a reactive hook (`useRealtimeTickets`) mounted at the shell level. When a WebSocket event arrives, the hook calls:
```ts
queryClient.invalidateQueries({ queryKey: ['tickets'] });
queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticketId] });
queryClient.invalidateQueries({ queryKey: ['analytics'] });
```
This guarantees eventual consistency without heavy manual state synchronization or duplicate data normalization.

---

## 6. Threat Modeling & Security Controls

| Threat / Vulnerability | Risk | Mitigation in TenantPro |
| :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | High | Route parameters validated against `user.propertyId` and `user.userId`. Verified by automated integration test suite. |
| **Cross-Site Scripting (XSS)** | High | React automated DOM escaping; JWTs stored in `httpOnly` cookies; strict Zod input validation. |
| **Cross-Site Request Forgery (CSRF)** | Medium | `SameSite` cookie enforcement; custom JSON header requirements on mutating endpoints. |
| **Denial of Service / Brute Force** | Medium | Global rate limiter (300 req / 15 min), upload rate limiter (30 req / 15 min), and strict payload size limits. |
| **Information Disclosure** | Medium | Generic authentication error messages ("Email or password is incorrect"); exclusion of password hashes from Mongoose queries. |
| **MIME / File Upload Exploits** | High | Multer memory storage with file type whitelisting (JPG, PNG, WebP, GIF) and 5MB size caps before Cloudinary upload. |

---

## 7. Operational Metrics & Analytics Computation

Turnaround analytics are calculated dynamically via `GET /api/analytics`:
* **Turnaround Speed**:
  $$\text{Average Resolution Hours} = \frac{\sum (\text{resolvedAt} - \text{createdAt})}{N_{\text{resolved}}}$$
* **Property Health Score**:
  $$\text{Health Score} = \frac{N_{\text{resolved}} + N_{\text{closed}}}{N_{\text{total}}} \times 100$$
* **Technician Efficiency Leaderboard**: Aggregates active vs resolved ticket counts per technician in the property.

---

## 8. Deployment Topologies

### Topology A: Decoupled Cloud PaaS (Recommended for Portfolio)
* **Frontend**: Vercel Edge CDN (`tenantpro.vercel.app`)
* **Backend**: Render Web Service (`tenantpro-api.onrender.com`)
* **Database**: MongoDB Atlas M0 Cluster
* **Media**: Cloudinary CDN

### Topology B: Containerized Docker Orchestration
* Single-host deployment using `docker-compose.yml`:
  * `client` container (Nginx reverse-proxying `/api` and `/socket.io` to backend).
  * `server` container (Node 24 Alpine runner).
  * `mongodb` container (MongoDB 7 with persistent volume).
