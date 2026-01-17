# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S blueblog -u 1001

# Copy built application
COPY --from=builder --chown=blueblog:nodejs /app/package*.json ./
COPY --from=builder --chown=blueblog:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=blueblog:nodejs /app/dist ./dist
COPY --from=builder --chown=blueblog:nodejs /app/prisma ./prisma

# Switch to non-root user
USER blueblog

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "dist/server.js"]