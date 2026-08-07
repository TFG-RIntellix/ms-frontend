# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Override environment for Docker
COPY src/app/core/config/environment.docker.ts src/app/core/config/environment.ts
RUN npx ng build --configuration=production

# Stage 2: Nginx
FROM nginx:alpine
# The output folder might be dist/rintellix-spa/browser depending on Angular version
# In Angular 17+, the build output for the browser is inside the /browser directory
COPY --from=builder /app/dist/rintellix-spa/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4200
