# Multi-stage production Dockerfile for TenantPro React client
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

# Install dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile

# Copy client source and build production bundle
COPY client/ ./client/
WORKDIR /app/client
RUN pnpm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
