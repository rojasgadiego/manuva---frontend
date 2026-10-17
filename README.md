# Manuva — Club Canotaje (frontend)

Vue 3 + Vuex + Vue Router. Consume la API .NET del repo
[`ClubCanotaje`](https://github.com/rojasgadiego/ClubCanotaje) (no `manuva---backend`).

## Desarrollo

1. Levantar la API (ver README de `ClubCanotaje`): queda en `https://localhost:7001`.
2. Frontend:
   ```
   npm install
   npm run serve      # http://localhost:8080
   ```

La URL de la API se toma de `VUE_APP_API_URL`, definida en `.env.development`.
La sesión usa la cookie HttpOnly `jwt` que crea la API en `/auth/login`, por eso axios
envía `withCredentials` y la API debe tener `http://localhost:8080` en `AllowedOrigins`.

## Producción

```
cp .env.example .env.production.local   # poner la URL real de la API
npm run build                           # genera dist/
```

## Otros comandos

```
npm run lint
```
