# TenantPro

TenantPro is a full-stack property-maintenance and complaint-management platform for apartments, hostels, and rental properties. Tenants report issues, managers assign technicians, and all users track repairs in real time.

## Tech stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, TypeScript, REST APIs
- Database: MongoDB Atlas with Mongoose
- Security: JWT, bcrypt, HTTP-only cookies, Helmet, CORS, rate limiting
- Real-time updates: Socket.io
- Media: Cloudinary
- Testing: Vitest, React Testing Library, Supertest
- DevOps: Docker and GitHub Actions

## Repository structure

```text
client/  # React application
server/  # Express API
docs/    # Architecture and API documentation
postman/ # API request collection
```

## Project progress

- [x] React + TypeScript + Vite client scaffolded
- [x] Express + TypeScript server scaffolded
- [x] Health-check endpoint added
- [x] MongoDB/Mongoose connection and core data models added (Day 2)
- [x] MongoDB Atlas connection string configured
- [x] Manager registration, JWT login cookies, and role middleware added (Day 3)
- [x] Team management and ticket workflow APIs added (Day 4)
- [x] React Router, Tailwind design system, authentication screens, and manager dashboard shell added (Day 5)
- [x] Secure frontend sign-in, manager registration, React Query, and live dashboard ticket data added (Day 6)
- [x] Ticket list with search/filters, ticket details, comments, audit timeline, and technician assignment (Day 7)
- [x] Resident onboarding directory and technician roster management (Day 8)
- [x] Real-time updates with Socket.io for tickets, status, assignments, and comments (Day 9-10)
- [x] File attachments via Cloudinary and operational analytics dashboard (Day 11-12)
- [ ] Testing, Docker, CI/CD, and deployment polish (Day 13-14)

