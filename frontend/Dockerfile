FROM node:18-alpine as build

WORKDIR /app

# Copy package files dan install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build app
RUN npm run build

# Tahap produksi
FROM nginx:alpine

# Copy hasil build ke nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy konfigurasi nginx (opsional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Command untuk menjalankan nginx
CMD ["nginx", "-g", "daemon off;"]