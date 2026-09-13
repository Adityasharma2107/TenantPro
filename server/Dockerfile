# Multi-stage production Dockerfile for TenantPro Express API
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

# Stage 2: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=dependencies /app ./
COPY server/ ./server/

WORKDIR /app/server
EXPOSE 5000

USER node
CMD ["pnpm", "start"]
