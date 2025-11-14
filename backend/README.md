# Junction 2025 Backend

A baseline backend API built with Gin-Gonic web framework.

## Features

- RESTful API structure
- Environment-based configuration
- Basic CRUD operations
- Health check endpoint
- Clean project structure

## Prerequisites

- Go 1.21 or higher
- Git

## Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
go mod tidy
```

3. Copy the `.env` file and adjust settings if needed:

```bash
# .env is already included, modify PORT and GIN_MODE as needed
```

## Running the Server

### Development mode

```bash
go run main.go
```

### Build and run

```bash
go build -o server
./server
```

## API Endpoints

### Health Check

- `GET /health` - Check server status

### API v1

- `GET /api/v1/ping` - Simple ping endpoint
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Project Structure

```
backend/
├── main.go           # Application entry point
├── go.mod           # Go module definition
├── .env             # Environment variables
├── handlers/        # Request handlers
│   ├── health.go
│   └── user.go
├── models/          # Data models
│   └── user.go
└── routes/          # Route definitions
    └── routes.go
```

## Environment Variables

- `PORT` - Server port (default: 8080)
- `GIN_MODE` - Gin mode: debug, release, or test (default: debug)

## Example Usage

### Get all users

```bash
curl http://localhost:8080/api/v1/users
```

### Create a user

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"id":"3","name":"Alice Johnson","email":"alice@example.com"}'
```

### Get user by ID

```bash
curl http://localhost:8080/api/v1/users/1
```

## Next Steps

- Add database integration (PostgreSQL, MongoDB, etc.)
- Implement authentication & authorization
- Add middleware (CORS, logging, rate limiting)
- Write tests
- Add validation and error handling improvements
- Implement pagination for list endpoints
