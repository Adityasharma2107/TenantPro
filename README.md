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

## Day 1 status

- [x] React + TypeScript + Vite client scaffolded
- [x] Express + TypeScript server scaffolded
- [x] Health-check endpoint added
- [x] MongoDB/Mongoose connection and core data models added (Day 2)
- [ ] MongoDB Atlas connection string configuration
- [ ] Authentication (Day 3)
- [ ] Ticket workflow (Day 4)
- [ ] Dashboards and real-time updates (Day 5-10)
- [ ] Tests, CI/CD, Docker, and deployment (Day 11-14)
