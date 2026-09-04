# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app
# Prisma's musl engine links against OpenSSL 3
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
# /root/.npm is a BuildKit cache mount: it persists on the build host between
# builds but is never written into the image, so when package*.json changes
# npm ci reinstalls from local tarballs instead of re-downloading everything.
# --no-audit: the post-install registry audit call has been observed hanging
# for npm's full 5-minute fetch timeout on this dependency set, and its output
# is meaningless inside an image build anyway.
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

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
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
    && npx prisma generate

COPY --from=builder /app/dist ./dist

# /app stays root-owned and read-only for the node user. The app never writes
# to disk, and a recursive chown here would copy all of node_modules into a
# second ~300MB layer on every build.
USER node

# HTTP API and WebSocket server
EXPOSE 5000 9000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO /dev/null http://127.0.0.1:5000/health || exit 1

# Apply pending migrations, then exec node so it receives signals as PID 1
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/server.js"]
