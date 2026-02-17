# Multi-stage build for production
FROM node:20 AS builder

WORKDIR /app

# Copy root package files for workspace
COPY ../../package.json ../../package-lock.json ./
COPY ../../packages ./packages

# Copy server package files
COPY package.json package-lock.json ./server/
WORKDIR /app/server

# Install all dependencies (workspaces will be linked)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root workspace files
COPY ../../package.json ../../package-lock.json ./
COPY ../../packages ./packages

# Copy server package files
COPY package.json package-lock.json ./server/
WORKDIR /app/server

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/server/dist ./dist

# Expose the server port
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
