# =============================================================================
# Stage 1: Build (Node.js)
# =============================================================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies (layer-cached)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_BASE_URL is baked into the bundle at build time.
# The browser connects directly to localhost:8080, NOT the Docker service name.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# =============================================================================
# Stage 2: Serve (Nginx)
# =============================================================================
FROM nginx:alpine AS runtime

# Copy production build
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config with React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
