# Ticket Workflow API

Day 4 implements the full backend maintenance workflow:

```text
Manager creates tenant/technician → Tenant reports issue → Manager reviews and assigns → Technician updates work → All users follow the timeline
```

## Team management (manager only)

- `POST /api/team/users` creates a tenant or technician for the manager's property.
- `GET /api/team` lists that property's tenants and technicians.

A tenant requires a `unitNumber`; a technician can have a `specialization` such as `Plumbing`.

## Tickets

- `POST /api/tickets` — tenant creates a ticket.
- `GET /api/tickets` — role-scoped ticket list with optional `status`, `priority`, `category`, `search`, `page`, and `limit` filters.
- `GET /api/tickets/:ticketId` — ticket details, comments, and activity timeline.
- `PATCH /api/tickets/:ticketId/assignment` — manager assigns a technician.
- `PATCH /api/tickets/:ticketId/priority` — manager sets priority.
- `PATCH /api/tickets/:ticketId/status` — manager or assigned technician updates status.
- `POST /api/tickets/:ticketId/comments` — permitted user adds a comment.

## Priority rule

Tenants choose priority only for `plumbing`, `electrical`, and `security`. For `appliance`, `internet`, `cleaning`, and `other`, the API stores `unassigned`; a manager reviews and sets the priority later.

## Authorization rules

- Managers access tickets from their own property and manage their team.
- Tenants create and view only their own tickets.
- Technicians see only tickets assigned to them and can mark them `in_progress` or `resolved`.
