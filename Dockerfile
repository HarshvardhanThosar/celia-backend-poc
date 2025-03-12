# Use the latest Node.js version
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the project
RUN npm run build

# Expose necessary ports
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]