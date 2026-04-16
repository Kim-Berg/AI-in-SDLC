# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy workspace package.json files for npm ci
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm ci --ignore-scripts

# ---- Stage 2: Build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Build shared package
WORKDIR /app/packages/shared
RUN npx tsc

# Build web app
WORKDIR /app/apps/web
RUN npx vite build

# ---- Stage 3: Nginx ----
FROM nginx:alpine AS runtime

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy nginx config as a template (envsubst replaces ${API_URL} at startup)
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built static files
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

# Default API_URL for docker-compose; override for other environments
ENV API_URL=http://api:3001

# Substitute only $API_URL (preserve nginx variables like $uri, $host)
CMD ["/bin/sh", "-c", "envsubst '$API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
