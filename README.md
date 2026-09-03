## Swagger Documentation

Interactive API documentation is provided using Swagger UI and OpenAPI.

### Live API Documentation

The deployed API documentation is available at:

https://reservation-api-cembc-hfebdgh3exefe2ez.italynorth-01.azurewebsites.net/api/docs

### Local Documentation

When running the application locally:

```text
http://localhost:3000/api/docs
```
---

# Reservation API

A production-ready RESTful API for managing users, resources, and reservations.

Built with Node.js, Express, Prisma ORM, and PostgreSQL, the project provides authentication, role-based authorization, reservation conflict detection, validation, centralized error handling, API documentation, automated testing, and cloud deployment support.

## Tech Stack

### Backend
- Node.js
- Express.js
- JavaScript (ES Modules)

### Database
- PostgreSQL
- Prisma ORM
- Neon PostgreSQL

### Authentication & Security
- JSON Web Token (JWT)
- bcrypt
- Role-Based Access Control (RBAC)

### Validation & Error Handling
- Zod
- Centralized error handling middleware
- Async error handling

### Testing
- Jest
- Supertest
- Dedicated PostgreSQL test database

### Documentation
- Swagger UI
- OpenAPI

### Deployment
- Azure App Service
- Neon PostgreSQL
- GitHub Actions

---

## Features

### Authentication

- User registration
- User login
- Password hashing with bcrypt
- JWT-based authentication
- Protected API endpoints
- Role-based authorization
- USER and ADMIN roles

### Resource Management

- Create resources
- Retrieve all resources
- Retrieve a resource by ID
- Update resources
- Delete resources
- Resource activation status
- Capacity and location information
- Pagination and filtering

### Reservation Management

- Create reservations
- Retrieve reservations
- Retrieve reservations by ID
- Update reservations
- Cancel reservations
- Reservation ownership validation
- Administrator access to all reservations
- Reservation status management

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

These reservations do not conflict.

Only active reservations participate in conflict detection.

### Authorization

The API supports two roles:

```text
USER
ADMIN
```

Users can manage their own reservations, while administrators can access and manage reservations across the system.

---

## Project Architecture

The application follows a layered architecture:

```text
src/
├── config/
│   ├── prisma.js
│   └── swagger.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── resource.controller.js
│   └── reservation.controller.js
│
├── services/
│   ├── auth.service.js
│   ├── resource.service.js
│   └── reservation.service.js
│
├── routes/
│   ├── auth.routes.js
│   ├── resource.routes.js
│   └── reservation.routes.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
│
├── validators/
│   ├── auth.validator.js
│   ├── resource.validator.js
│   └── reservation.validator.js
│
├── utils/
│   ├── app-error.js
│   └── async-handler.js
│
├── app.js
└── server.js
```

### Request Flow

```text
HTTP Request
     ↓
Route
     ↓
Validation Middleware
     ↓
Authentication / Authorization Middleware
     ↓
Controller
     ↓
Service
     ↓
Prisma ORM
     ↓
PostgreSQL
```

This separation keeps HTTP handling, business logic, validation, authentication, and database access independent from each other.

---

## Database Models

### User

```text
User
├── id
├── fullName
├── email
├── passwordHash
├── role
├── createdAt
└── reservations
```

### Resource

```text
Resource
├── id
├── name
├── description
├── capacity
├── location
├── isActive
├── createdAt
└── reservations
```

### Reservation

```text
Reservation
├── id
├── userId
├── resourceId
├── startDate
├── endDate
├── status
├── createdAt
├── user
└── resource
```

### Reservation Status

```text
ACTIVE
CANCELLED
COMPLETED
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate a user | No |

### Resources

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resources` | Get resources |
| GET | `/api/resources/:id` | Get resource by ID |
| POST | `/api/resources` | Create resource |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource |

Resource endpoints support validation, authorization, pagination, and filtering where applicable.

### Reservations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reservations` | Get accessible reservations |
| GET | `/api/reservations/:id` | Get reservation by ID |
| POST | `/api/reservations` | Create reservation |
| PUT | `/api/reservations/:id` | Update reservation |
| DELETE | `/api/reservations/:id` | Cancel/delete reservation |

Reservation operations require authentication.

The authenticated user's identity is obtained from the JWT rather than trusting a client-provided user ID.

---

## Authentication

Protected endpoints expect a JWT using the Bearer authentication scheme:

```http
Authorization: Bearer <token>
```

After successful login, the API generates a token containing the authenticated user's ID and role.

Example payload:

```json
{
  "userId": 1,
  "role": "USER"
}
```

The token is verified by authentication middleware before protected requests reach the controller.

---

## Validation

Incoming request data is validated using Zod.

Validation is separated from controllers through dedicated validator modules.

Examples of validated data include:

- Email format
- Password requirements
- Resource information
- Reservation IDs
- Start and end dates
- Query parameters
- Pagination parameters

Invalid requests are rejected before reaching the business logic layer.

---

## Error Handling

The application uses centralized error handling.

Expected application errors are represented using a custom `AppError` class and forwarded to the global error middleware.

This provides consistent error responses across the API.

Example:

```json
{
  "message": "Resource not found"
}
```

Async route handlers are wrapped using a reusable async handler utility to avoid repetitive `try/catch` blocks.

---

## Pagination and Filtering

List endpoints support query parameters for retrieving smaller and more relevant datasets.

Example:

```http
GET /api/resources?page=1&limit=10
```

Filtering parameters can also be supplied where supported by the endpoint.

This prevents clients from having to retrieve the entire dataset for every request.

---

## Swagger Documentation

Interactive API documentation is provided using Swagger UI and OpenAPI.

When running locally:

```text
http://localhost:3000/api/docs
```

Swagger can be used to inspect endpoints, request schemas, responses, and authentication requirements.

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

Do not commit `.env` files to source control.

An `.env.example` file can be used to document the required environment variables without exposing credentials.

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/CemBC/ReservationApi.git
cd ReservationApi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env
```

and configure the PostgreSQL connection string and JWT secret.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply database migrations

```bash
npx prisma migrate deploy
```

For development environments, migrations can also be created with:

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
npm run seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will run by default at:

```text
http://localhost:3000
```

---

## Production

Start the application with:

```bash
npm start
```

The server uses the platform-provided port when deployed:

```javascript
const PORT = process.env.PORT || 3000;
```

This allows the same application to run locally and in cloud environments.

---

## Testing

The project contains integration tests using Jest and Supertest.

A dedicated PostgreSQL test database is used to keep test data isolated from development and production data.

Create:

```text
.env.test
```

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/reservation_test"
JWT_SECRET="test-secret"
NODE_ENV="test"
```

Run the tests with:

```bash
npm test
```

Test coverage includes:

- Registration
- Login
- Authentication
- Authorization
- Resource operations
- Reservation operations
- Reservation ownership
- ADMIN permissions
- Reservation conflict detection
- Validation
- Error responses

---

## Deployment Architecture

The production architecture is designed as:

```text
                    Internet
                       │
                       ▼
              Azure App Service
                       │
                 Node.js / Express
                       │
                       ▼
                   Prisma ORM
                       │
                       ▼
               Neon PostgreSQL
```

### Application Hosting

The Node.js API is configured for deployment to Azure App Service.

Production environment variables are configured through Azure App Service configuration rather than committed to the repository.

### Production Database

PostgreSQL is hosted using Neon.

The production database connection is provided through the `DATABASE_URL` environment variable.

### Continuous Deployment

GitHub Actions is configured to build and deploy the application.

The deployment pipeline performs:

```text
Push to main
     ↓
GitHub Actions
     ↓
Install dependencies
     ↓
Generate Prisma Client
     ↓
Build
     ↓
Create deployment artifact
     ↓
Authenticate with Azure
     ↓
Deploy to Azure App Service
```

Sensitive Azure deployment credentials are stored using GitHub repository secrets and Azure-managed authentication rather than source code.

---

## Security Considerations

The project implements several security practices:

- Passwords are hashed using bcrypt
- Authentication uses signed JWTs
- Protected routes require authentication
- Role-based authorization is enforced server-side
- Reservation ownership is validated server-side
- Client-provided user IDs are not trusted for reservation ownership
- Request bodies and query parameters are validated
- Secrets are stored in environment variables
- `.env` files are excluded from source control
- Database queries are performed through Prisma ORM

---

## Development Highlights

This project demonstrates practical backend development concepts including:

- REST API design
- Layered backend architecture
- PostgreSQL relational database design
- Prisma ORM
- Database migrations
- Authentication and authorization
- Password hashing
- JWT authentication
- Role-based access control
- Business-rule implementation
- Reservation conflict detection
- Request validation
- Centralized error handling
- Pagination and filtering
- Async JavaScript
- Integration testing
- Swagger/OpenAPI documentation
- Environment-based configuration
- Cloud-hosted PostgreSQL
- Azure App Service deployment configuration
- CI/CD with GitHub Actions


---

## Author

**Cem Başar Ceylani**

Computer Engineer

GitHub: CemBC
