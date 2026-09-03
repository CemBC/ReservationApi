# Reservation API

A RESTful reservation management API built with Node.js, Express, PostgreSQL, and Prisma.

The API allows users to register, authenticate, browse available resources, and manage their own reservations. Administrators can manage resources and access reservations across all users.

The project includes JWT-based authentication, role-based authorization, reservation conflict detection, request validation, pagination, filtering, centralized error handling, and Swagger/OpenAPI documentation.

---

## Features

### Authentication

- User registration
- User login
- Password hashing with bcrypt
- JWT-based authentication
- Protected API endpoints

### Authorization

Two roles are supported:

- `USER`
- `ADMIN`

Users can:

- Browse resources
- Create reservations
- View their own reservations
- Update their own reservations
- Cancel their own reservations

Administrators can:

- Perform all user operations
- View reservations from all users
- Create resources
- Update resources
- Delete resources

### Resource Management

Resources support:

- Create
- Read
- Update
- Delete
- Pagination
- Active/inactive filtering
- Location filtering
- Name and description search

Resource modification endpoints are restricted to administrators.

### Reservation Management

Reservations support:

- Create reservation
- List reservations
- Get reservation by ID
- Update reservation
- Cancel reservation
- Pagination
- Status filtering
- Resource filtering

Users can only access their own reservations, while administrators can access reservations belonging to any user.

### Reservation Conflict Detection

The API prevents overlapping active reservations for the same resource.

Two reservations conflict when:

```text
existing.startDate < new.endDate
AND
existing.endDate > new.startDate
```

Back-to-back reservations are allowed.

For example:

```text
Reservation A: 10:00 - 12:00
Reservation B: 12:00 - 14:00
```

is valid.

### Validation

Request validation is implemented using Zod.

Validation covers:

- Authentication requests
- Resource creation and updates
- Reservation creation and updates
- Route parameters
- Pagination parameters
- Filter parameters
- ISO 8601 date formats

Invalid requests return structured validation errors.

### Error Handling

The API uses centralized error handling with:

- Custom `AppError`
- Async route handler wrapper
- Global error middleware
- 404 route handler

Unexpected server errors are logged internally without exposing stack traces to clients.

### API Documentation

Interactive Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api/docs
```

Swagger supports JWT authentication, allowing protected endpoints to be tested directly from the browser.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod
- JSON Web Token
- bcrypt
- Swagger / OpenAPI
- Nodemon

---

## Project Structure

```text
ReservationApi/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── config/
│   │   ├── prisma.js
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── reservation.controller.js
│   │   └── resource.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── role.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── reservation.routes.js
│   │   └── resource.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── reservation.service.js
│   │   └── resource.service.js
│   │
│   ├── utils/
│   │   ├── app-error.js
│   │   └── async-handler.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── reservation.validator.js
│   │   └── resource.validator.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Database Models

### User

```text
id
fullName
email
passwordHash
role
createdAt
```

Each email address must be unique.

Roles:

```text
USER
ADMIN
```

### Resource

```text
id
name
description
capacity
location
isActive
createdAt
```

### Reservation

```text
id
userId
resourceId
startDate
endDate
status
createdAt
```

Reservation statuses:

```text
ACTIVE
CANCELLED
COMPLETED
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |

### Resources

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/resources` | List resources | Authenticated |
| GET | `/api/resources/:id` | Get resource by ID | Authenticated |
| POST | `/api/resources` | Create resource | Admin |
| PUT | `/api/resources/:id` | Update resource | Admin |
| DELETE | `/api/resources/:id` | Delete resource | Admin |

### Reservations

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/reservations` | List accessible reservations | Authenticated |
| GET | `/api/reservations/:id` | Get reservation by ID | Owner / Admin |
| POST | `/api/reservations` | Create reservation | Authenticated |
| PUT | `/api/reservations/:id` | Update reservation | Owner / Admin |
| PATCH | `/api/reservations/:id/cancel` | Cancel reservation | Owner / Admin |

---

## Pagination and Filtering

### Resources

Example:

```http
GET /api/resources?page=1&limit=10&isActive=true&search=room
```

Supported query parameters:

```text
page
limit
isActive
location
search
```

The `search` parameter searches resource names and descriptions.

### Reservations

Example:

```http
GET /api/reservations?page=1&limit=10&status=ACTIVE&resourceId=1
```

Supported query parameters:

```text
page
limit
status
resourceId
```

Paginated endpoints return:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## Authentication

Protected endpoints require a JWT access token.

Send the token using the `Authorization` header:

```http
Authorization: Bearer <token>
```

Example login request:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

A successful login returns a JWT and user information.

The authenticated user's identity is extracted from the JWT. Reservation creation does not accept a trusted `userId` from the request body.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ReservationApi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`.

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/reservation_db"
JWT_SECRET="your_super_secret_jwt_key"
```

Do not commit the `.env` file.

### 4. Create the database

Create a PostgreSQL database named:

```text
reservation_db
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Seed the database

```bash
npm run seed
```

### 8. Start the development server

```bash
npm run dev
```

The API will run at:

```text
http://localhost:3000
```

Swagger documentation:

```text
http://localhost:3000/api/docs
```

---

## Example Reservation Request

```http
POST /api/reservations
```

```json
{
  "resourceId": 1,
  "startDate": "2026-10-05T10:00:00.000Z",
  "endDate": "2026-10-05T12:00:00.000Z"
}
```

The user ID is automatically obtained from the authenticated user's JWT.

---

## HTTP Status Codes

The API uses standard HTTP status codes including:

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `204` | Successful deletion |
| `400` | Validation or invalid request |
| `401` | Authentication required or invalid token |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict with current resource state |
| `500` | Internal server error |

---

## Security

The API implements several security practices:

- Passwords are hashed using bcrypt
- Authentication uses signed JWTs
- JWT secrets are stored in environment variables
- Users cannot assign themselves the `ADMIN` role during registration
- Resource modification is restricted to administrators
- Reservation ownership is enforced server-side
- Reservation user IDs are derived from authenticated JWTs
- Request payloads and parameters are validated using Zod
- Internal server errors do not expose stack traces to clients

---

## Development Status

Completed:

- PostgreSQL database integration
- Prisma ORM and migrations
- Resource CRUD
- Reservation workflow
- Reservation conflict detection
- JWT authentication
- Role-based authorization
- Reservation ownership authorization
- Zod request validation
- Global error handling
- Pagination and filtering
- Swagger/OpenAPI documentation

Planned:

- Automated integration tests
- Authentication and authorization tests
- Reservation conflict tests
- Production deployment
- CI/CD with GitHub Actions

---

## License

This project is intended for educational and portfolio purposes.