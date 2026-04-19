# Stage 1: Build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine
WORKDIR /app
# Install minimal web server
RUN npm install -g serve
# Copy only the compiled assets from the builder stage
COPY --from=builder /app/dist ./dist
EXPOSE 3000
# Run the application
CMD ["serve", "-s", "dist", "-l", "3000"]
