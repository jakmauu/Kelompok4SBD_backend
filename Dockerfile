FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Environment variable untuk port
ENV PORT=5000

# Expose port
EXPOSE 5000

# Command untuk menjalankan aplikasi
CMD ["node", "index.js"]