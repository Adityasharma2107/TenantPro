# Authentication API

TenantPro uses a JWT stored in an HTTP-only cookie. This means the browser sends the login session automatically, but React code cannot directly read the token.

## Manager registration

`POST /api/auth/register`

Only the first manager self-registers. That request also creates the property they manage. Managers will later add tenant and technician accounts from the dashboard.

```json
{
  "name": "Aditya Sharma",
  "email": "aditya@example.com",
  "password": "StrongPass123",
  "property": {
    "name": "Green View Apartments",
    "address": {
      "line1": "12 Lake Road",
      "city": "Delhi",
      "state": "Delhi",
      "postalCode": "110001"
    },
    "unitCount": 24
  }
}
```

The password must contain at least eight characters, including uppercase and lowercase letters and a number.

## Login

`POST /api/auth/login`

```json
{
  "email": "aditya@example.com",
  "password": "StrongPass123"
}
```

## Current session

`GET /api/auth/me`

This protected endpoint returns the current user when a valid login cookie is present.

## Logout

`POST /api/auth/logout`

This removes the authentication cookie from the browser.

## Safety measures

- Passwords are hashed with bcryptjs before MongoDB storage.
- JWTs are signed with `JWT_SECRET`, which belongs only in `server/.env`.
- Authentication routes are limited to 10 attempts per 15 minutes.
- Authorization middleware is ready for manager, tenant, and technician permissions.
