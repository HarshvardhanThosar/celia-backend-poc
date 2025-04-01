# Use Node.js base image
FROM node:22.14.0

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --silent

# Install Nest CLI globally and ensure it's executable
RUN npm install -g @nestjs/cli && chmod +x /usr/local/bin/nest

# Copy source code
COPY . .

# Expose the app port
EXPOSE 3000

# Run in dev mode
CMD ["npm", "run", "start:dev"]