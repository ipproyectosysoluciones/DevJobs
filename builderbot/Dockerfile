# BuilderBot Docker Image
# Multi-stage build for production with pnpm v11

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && apk add --no-cache git

# Install pnpm v11 (última versión)
RUN npm install -g pnpm@11

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies (ignorar scripts para evitar errores)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source
COPY . .

# Stage 2: Deploy
FROM node:22-alpine AS deploy

WORKDIR /app

ARG PORT=3008
ENV PORT=$PORT
EXPOSE $PORT

# Install runtime dependencies
RUN apk add --no-cache libwebp libwebp-dev

# Install pnpm v11
RUN npm install -g pnpm@11

COPY --from=builder /app ./
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs

# Production install
RUN pnpm install --production --ignore-scripts \
    && rm -rf node_modules/.cache \
    && chown -R nodejs:nodejs /app

USER nodejs

CMD ["pnpm", "start"]