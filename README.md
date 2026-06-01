# EDENET RealEstate Backend

A Node.js + Express backend for a real estate management system with Role-Based Access Control (RBAC) and JWT authentication.

## Key Features

- Public user signup with default `tenant` role
- Role-based account creation with `admin`, `tenant`, `owner` roles
- Access token + refresh token authentication
- Secure `HttpOnly` refresh token cookies
- Admin-only and authenticated user routes
- PostgreSQL database with Sequelize ORM
- Docker Compose support

## Tech Stack

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT
- Zod validation
- Docker / Docker Compose

## Requirements

- Node.js 18+ recommended
- npm
- PostgreSQL
- Docker (optional, for containerized development)

## Installation

```bash
git clone https://github.com/YomRTZ/EDENET-RealEstate-System.git
cd talnet_management_system_backend
npm install
```

## Environment Variables

Create a `.env` file at the project root with the following values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=talent_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=CHANGE_ME_ACCESS_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_REFRESH_SECRET

FRONTEND_URL=http://localhost:3000
DOCUMENT_ENCRYPTION_KEY=REPLACE_WITH_BASE64_32_BYTE_KEY
```

Add `DOCUMENT_ENCRYPTION_KEY` (base64-encoded 32-byte key) to encrypt/decrypt uploaded documents stored under `uploads/documents_encrypted`.

> Generate secure secrets with:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Database Setup

### Run migrations

```bash
npx sequelize-cli db:migrate
```

### Seed initial data

```bash
npm run seed
```

This creates default roles and a seeded admin account.

## Scripts

- `npm run start` — start the server
- `npm run dev` — start the server with nodemon
- `npm run seed` — run the database seeder
- `npm run sync` — sync the database schema
- `npm run migrate` — run Sequelize migrations
- `npm run migrate:undo` — undo the last migration
- `npm run migrate:status` — show migration status

## Running Locally

```bash
npm run dev
```

The API listens on the port defined in `.env` (default `5000`).

## Docker

To start the backend with Docker Compose:

```bash
docker-compose up --build
```

## Authentication Flow

- `POST /auth/signup` — register a new user (default role: `user`)
- `POST /auth/login` — authenticate and receive an access token
- `POST /auth/refresh-token` — refresh the access token using the cookie-stored refresh token
- `POST /auth/logout` — revoke refresh token and clear cookie

### Authorization

- Access token must be sent as `Authorization: Bearer <ACCESS_TOKEN>`
- Refresh token is stored in an `HttpOnly` cookie and sent automatically by the browser

## API Endpoints

| Module | Endpoint | Method | Access |
| --- | --- | --- | --- |
| Auth | `/auth/signup` | POST | Public |
| Auth | `/auth/login` | POST | Public |
| Auth | `/auth/refresh-token` | POST | Public (cookie) |
| Auth | `/auth/logout` | POST | Authenticated |
| Admin | `/admin/dashboard` | GET | Admin |
| Admin | `/admin/listUsers` | GET | Admin |
| User | `/user/profile` | GET | Authenticated |

## Security Notes

- Passwords are hashed with `bcryptjs`
- JWT access tokens are short-lived
- Refresh tokens are stored and validated in the database

## Project Structure

- `src/server.js` — application entry point
- `src/routes/` — route definitions
- `src/controllers/` — request handlers
- `src/services/` — business logic and helpers
- `src/models/` — Sequelize models
- `src/middlewares/` — authentication and validation middleware
- `src/migrations/` — database migration scripts
- `src/seeders/` — initial seed data
- `src/config/` — database and environment configuration

## Notes

- Use a REST client like Postman or Thunder Client to interact with the API
- Make sure the PostgreSQL database is running before executing migrations or seeds
- Keep JWT secrets secure and do not commit `.env` to version control
