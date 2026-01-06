# :speech_balloon: Real-Time Chat

A web application for real-time messaging in servers and channels. Users can join servers, create channels, send messages, and interact live with others. Built for scalability and responsiveness.

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

## :triangular_ruler: Repository layout

```
server/           # Node.js backend (Express, Socket.IO)
client/           # Next.js app (React)
sql/              # SQL and CQL bootstrapping
```

## :jigsaw: Prerequisites

- Node.js 18+ (recommended), npm or pnpm
- PostgreSQL
- MongoDB
- Cassandra
- Redis

## :gear: Configuration

Copy and fill env vars (see [server/env.ts](server/env.ts)).

Notes:
- The server reads env in [server/env.ts](server/env.ts).
- TTL is parsed and passed to Redis cache.

## :bank: Database setup

- PostgreSQL:
    - Create schema/tables from [sql/pg/createTable.cql](sql/pg/createTable.sql).
- Cassandra:
    - Create keyspace/tables from [sql/cassandra/createTable.cql](sql/cassandra/createTable.cql).

## :minidisc: Running locally

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Client dev scripts:
- Lint: ```bash npm run lint```
- Format: ```npm run format```
- Build: ```npm run build```
- Preview: ```npm run preview```

Docker Compose:
- See [docker-compose.yml](docker-compose.yml) for multi-service setup.

## :pencil: License

This project is licensed under the GPL-3.0 license. See [LICENSE](LICENSE).
