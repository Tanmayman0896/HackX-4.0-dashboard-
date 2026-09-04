# =============================
# Stage 1: Builder
# =============================
FROM node:20-alpine AS builder
WORKDIR /app

ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
# --ignore-scripts skips the husky "prepare" hook, which has no .git here
RUN npm ci --ignore-scripts

COPY . .

# NEXT_PUBLIC_* values are inlined into the browser bundle at build time,
# so they must be passed as build args (see docker-compose.yml / CI).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# =============================
# Stage 2: Runtime
# =============================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output: a self-contained server with only the
# node_modules it actually needs.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/login || exit 1

CMD ["node", "server.js"]
