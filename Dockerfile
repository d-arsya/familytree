# Stage 1: base deps (with Bun)
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# copy bun binary (faster than npm install -g)
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

# install deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Stage 2: builder
FROM base AS builder
WORKDIR /app

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# generate prisma client
RUN bunx prisma generate

# build next
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 3: runner
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# user setup
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# copy bun (optional, for runtime scripts)
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

# copy app
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# prisma engines
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# next standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# uploads dir
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# entrypoint (we'll add next)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/entrypoint.sh"]