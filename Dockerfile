# ── Build ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# La API se sirve en el mismo dominio bajo /api (proxy de nginx), así la cookie de
# sesión es same-site y puede ser SameSite=Strict
ARG VUE_APP_API_URL=/api
ENV VUE_APP_API_URL=$VUE_APP_API_URL
RUN npm run build

# ── Runtime ────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine
# La imagen oficial procesa /etc/nginx/templates/*.template con envsubst al iniciar
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Dirección interna de la API (servicio "api" en docker compose)
ENV API_UPSTREAM=http://api:8080
EXPOSE 80
