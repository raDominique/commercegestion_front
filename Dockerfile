# ---------- Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BUILD_ENV=production
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY



ENV NODE_ENV=$BUILD_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build


# ---------- Runtime ----------
FROM nginx:1.25-alpine

# Nettoyage config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 4242

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:4242/ || exit 1

CMD ["nginx", "-g", "daemon off;"]