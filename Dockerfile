# Use the latest Node.js version
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (use caching)
COPY package*.json ./
RUN npm install --silent

# Copy only source code (avoid overwriting node_modules)
COPY . .

# Install nodemon for hot-reloading
RUN npm install -g nodemon

# Expose necessary ports
EXPOSE 3000

# Use nodemon for live-reloading during development
CMD ["npm", "run", "start:dev"]