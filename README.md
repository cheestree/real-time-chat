# :speech_balloon: Real-Time Chat

A web application for real-time messaging in servers and channels. Users can join servers, create channels, send messages, and interact live with others. Built for scalability and responsiveness.

## 🚀 Quick Start (Demo)

Want to try it immediately? Run with Docker:

```bash
docker-compose --env-file .env.docker.demo up --build
```

Then visit <http://localhost:3000>

## ✨ Features

- User authentication and profiles
- Create/join servers and channels
- Real-time messaging with WebSockets
- Message history stored in PostgreSQL and MongoDB
- Caching with Redis for performance
- Scalable architecture with Cassandra for distributed data

## :computer: Stack

- **Frontend**: Next.js (React, TypeScript)
- **Backend**: Node.js (Express, TypeScript)
- **Database**: PostgreSQL, MongoDB, Cassandra
- **Containerization**: Docker & Docker Compose.
- **Caching**: Redis JSON with TTL
- **WebSockets**: Socket.IO

## :triangular_rule: Repository layout

This project uses an **npm workspace** monorepo structure:

```
packages/
  shared/         # Shared TypeScript types and interfaces
src/
  server/         # Node.js backend (Express, Socket.IO)
  client/         # Next.js app (React)
sql/              # SQL and CQL bootstrapping
```

The `@rtchat/shared` package contains all common type definitions used by both client and server, ensuring type consistency across the full stack.

## :jigsaw: Prerequisites

- Node.js 18+ (recommended), npm or pnpm
- PostgreSQL
- MongoDB
- Cassandra
- Redis

## :gear: Configuration

### Three Ways to Run

**1. Docker (Demo) - Easiest:**

- Uses `.env.docker.demo` at project root
- All services in containers with Docker networking
- No manual database setup required

**2. Local Development (Demo) - No Config Needed:**

- Uses `src/server/.env.demo` and `src/client/.env.demo`
- Requires local PostgreSQL, MongoDB, Cassandra, Redis
- Services on localhost

**3. Production or Custom Setup:**

- Copy `.env.example` files and customize
- See [src/server/env.ts](src/server/env.ts) for all variables

### Environment File Guide

| File                      | Purpose             | Service Names                     |
| ------------------------- | ------------------- | --------------------------------- |
| `.env.docker.demo` (root) | Docker Compose demo | postgres, mongo, redis, cassandra |
| `src/server/.env.demo`    | Local dev demo      | localhost                         |
| `src/server/.env.example` | Local dev template  | localhost                         |
| `.env.example` (root)     | Docker template     | Empty (fill in)                   |

**Important variables for production:**

- `JWT_SECRET` - Strong random secret for authentication (min 32 chars)
- `DEMO_MODE` - Set to `false` for production
- Database credentials (PostgreSQL, MongoDB, Cassandra, Redis)
- `CORS_ORIGIN` - Your frontend URL
- `SERVER_PROFILE` - Set to `production` for production use

## :bank: Database setup

- PostgreSQL:
  - Create schema/tables from [sql/pg/createTable.cql](sql/pg/createTable.sql).
- Cassandra:
  - Create keyspace/tables from [sql/cassandra/createTable.cql](sql/cassandra/createTable.cql).

## :minidisc: Running the Application

### Option 1: Docker Compose (Recommended for Testing)

**Quick demo:**

```bash
docker-compose --env-file .env.docker.demo up --build
```

Visit <http://localhost:3000>

### Option 2: Local Development (Without Docker)

**Quick demo mode** (no .env file needed):

```bash
# First: Install all workspace dependencies (from project root)
npm install

# Build the shared package
npm run build:shared

# Terminal 1 - Backend with demo config
cd src/server
npm run dev:demo

# Terminal 2 - Frontend with demo config
cd src/client
npm run dev:demo
```

**With your own config:**

```bash
# First time: Install workspace dependencies and build shared package
npm install
npm run build:shared

# Create your .env files
cd src/server
cp .env.example .env
# Edit .env with your values

cd ../client
cp .env.example .env.local
# Edit .env.local with your values

# Then run normally
cd src/server && npm run dev
cd src/client && npm run dev
```

### Available Scripts

**Workspace (from project root):**

- `npm run build:shared` - Build the shared types package
- `npm run dev:shared` - Watch mode for shared package development
- `npm run dev:client` - Run client dev server
- `npm run dev:server` - Run server dev server

**Server:**

- `npm run dev` - Run with `.env` file (required)
- `npm run dev:demo` - Run with `.env.demo` (no setup needed)
- `npm start` - Production start
- `npm run lint` - Lint code
- `npm run format` - Format code

**Client:**

- `npm run dev` - Run with `.env.local` file (required)
- `npm run dev:demo` - Run with `.env.demo` (no setup needed)
- `npm run build` - Build for production
- `npm run lint` - Lint code
- `npm run format` - Format code

Docker Compose:

- See [docker-compose.yml](docker-compose.yml) for multi-service setup.

## :pencil: License

This project is licensed under the GPL-3.0 license. See [LICENSE](LICENSE).
