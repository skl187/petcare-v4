FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]