# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose the server port
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
