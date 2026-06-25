# ============ STAGE 1: build ============
# Compila la app dentro del contenedor, usando SIEMPRE las versiones exactas
# fijadas en package-lock.json. Así el build es igual en cualquier máquina
# (Windows, Mac, Linux, otro PC, CI, etc.), en vez de depender de un
# node_modules / dist generado localmente de antemano.
FROM node:22-alpine AS build

WORKDIR /app

# Copiamos primero solo los manifiestos de dependencias para aprovechar
# el cache de capas de Docker: si no cambian package.json/lock, esta capa
# no se vuelve a instalar en builds posteriores.
COPY package.json package-lock.json ./

# npm ci (en vez de npm install) instala EXACTAMENTE lo que dice
# package-lock.json, sin resolver de nuevo versiones. Es determinístico:
# misma entrada -> mismo node_modules, sin importar el sistema operativo
# o lo que tengas instalado localmente.
RUN npm ci

# Ahora copiamos el resto del código fuente y compilamos.
COPY . .
RUN npm run build

# ============ STAGE 2: runtime ============
# La imagen final NO lleva Node, ni node_modules, ni código fuente.
# Solo el resultado estático (dist/) servido por Nginx.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]