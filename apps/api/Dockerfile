# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy workspace package.json files for npm ci
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --ignore-scripts

# ---- Stage 2: Build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared package
WORKDIR /app/packages/shared
RUN npx tsc

# Generate Prisma client from Docker (PostgreSQL) schema
WORKDIR /app/apps/api
RUN npx prisma generate --schema=prisma/schema.docker.prisma

# Build API
RUN npx tsc

# ---- Stage 3: Runtime ----
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Copy built API
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/package.json ./

# Copy node_modules (includes Prisma client)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps-api-node_modules

# Merge hoisted and local node_modules
RUN cp -r ./apps-api-node_modules/* ./node_modules/ 2>/dev/null || true && rm -rf ./apps-api-node_modules

# Copy built shared package so runtime imports resolve
COPY --from=build /app/packages/shared/dist ./node_modules/@zava/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@zava/shared/package.json

# Copy entrypoint
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
