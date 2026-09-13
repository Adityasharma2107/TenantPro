# Multi-stage production Dockerfile for TenantPro Express API
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

# Stage 1: Install dependencies and compile TypeScript
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

COPY server/ ./server/
WORKDIR /app/server
RUN pnpm run build

# Stage 2: Minimal production runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist

WORKDIR /app/server
EXPOSE 5000

USER node
CMD ["node", "dist/server.js"]
