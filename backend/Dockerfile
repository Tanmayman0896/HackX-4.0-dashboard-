# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app
# Prisma's musl engine links against OpenSSL 3
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# ---------- Stage 2: Run ----------
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

# Runtime deps only. @prisma/client and the prisma CLI are runtime deps so the
# generated client is available to dist/server.js and migrate deploy works
# without downloading anything at container start.
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev --ignore-scripts \
    && npx prisma generate \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app
USER node

# HTTP API and WebSocket server
EXPOSE 5000 9000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO /dev/null http://127.0.0.1:5000/health || exit 1

# Apply pending migrations, then exec node so it receives signals as PID 1
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/server.js"]
