#Stage 1 - Install Dependencies -- First Temporary Image
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production


#Stage 2 - Final Image
FROM node:20-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy deps from stage 1 and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Don't run as root
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]