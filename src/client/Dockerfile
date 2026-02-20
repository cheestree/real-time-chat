FROM node:20-slim AS deps
WORKDIR /app

# Copy root workspace files (context is project root)
COPY package.json package-lock.json* ./
COPY packages ./packages

# Copy client source
COPY src/client ./src/client

# Install dependencies (workspaces will be linked)
RUN npm install --legacy-peer-deps

FROM node:20-slim AS builder
WORKDIR /app

# Copy everything from deps stage
COPY --from=deps /app ./

WORKDIR /app/src/client

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

# Make them available as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy root workspace files
COPY package.json package-lock.json* ./
COPY packages ./packages

# Copy client files
COPY --from=builder /app/src/client/public ./src/client/public
COPY --from=builder /app/src/client/.next ./src/client/.next
COPY --from=builder /app/src/client/package.json ./src/client/

WORKDIR /app/src/client

RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "start"]