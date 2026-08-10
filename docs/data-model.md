# TenantPro data model

```text
Property 1 --- * User
Property 1 --- * Ticket
User (tenant) 1 --- * Ticket
User (technician) 1 --- * Ticket (assigned)
Ticket 1 --- * Comment
Ticket 1 --- * ActivityLog
```

- **Property**: A hostel, apartment building, or rental property managed in TenantPro.
- **User**: A tenant, manager, or technician belonging to one property.
- **Ticket**: A maintenance complaint created by a tenant and handled by a technician.
- **Comment**: A message on a ticket from a tenant, manager, or technician.
- **ActivityLog**: An audit trail of important ticket actions, such as assignment or resolution.
