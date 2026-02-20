# Multi-stage build for production
FROM node:20 AS builder

WORKDIR /app

# Copy root package files for workspace (context is project root)
COPY package.json package-lock.json ./
COPY packages ./packages

# Copy server source
COPY src/server ./src/server

# Install all dependencies (includes workspace dependencies)
RUN npm ci --legacy-peer-deps

# Build the server
WORKDIR /app/src/server
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root workspace files
COPY package.json package-lock.json ./
COPY packages ./packages

# Copy server package files
COPY src/server/package.json src/server/package-lock.json ./src/server/

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/src/server/dist ./src/server/dist

WORKDIR /app/src/server

# Expose the server port
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
