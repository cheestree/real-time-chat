FROM node:20-alpine AS deps
WORKDIR /app

# Copy root workspace files
COPY ../../package.json ../../package-lock.json* ./
COPY ../../packages ./packages

# Copy client package files
COPY package.json package-lock.json* ./client/
WORKDIR /app/client

# Install dependencies (workspaces will be linked)
RUN npm install --legacy-peer-deps

# Copy client source
COPY . .

FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything from deps stage
COPY --from=deps /app ./

WORKDIR /app/client

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

# Make them available as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy root workspace files
COPY ../../package.json ../../package-lock.json* ./
COPY ../../packages ./packages

# Copy client files
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/package.json ./client/

WORKDIR /app/client

RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "start"]