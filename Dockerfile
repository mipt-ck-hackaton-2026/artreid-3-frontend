# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:24-alpine
WORKDIR /app
# Install minimal web server to run the npm package build
RUN npm install -g serve
# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist
EXPOSE 3000
# Run the application
CMD ["serve", "-s", "dist", "-l", "3000"]
