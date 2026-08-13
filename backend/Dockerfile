# ==============================================================================
# Stage 1: Build & Prisma Client Generation
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install system utilities needed for building native dependencies if any
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

COPY src ./src/

# Generate Prisma Client & Build TypeScript
RUN npx prisma generate
RUN npm run build

# Prune dev dependencies for lean production container
RUN npm prune --omit=dev

# ==============================================================================
# Stage 2: Minimal Production Runtime
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=3001

# Run container as non-root user for maximum security
USER node

# Copy built artefacts and production dependencies from builder stage
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/src/generated ./dist/src/generated

EXPOSE 3001

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health/live || exit 1

CMD ["node", "dist/src/index.js"]
