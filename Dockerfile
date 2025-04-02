# Use official Node image with Corepack
FROM node:22.14.0

# Enable Corepack and Yarn v4
RUN corepack enable && corepack prepare yarn@4.7.0 --activate

# Set working directory
WORKDIR /usr/src/app

# Copy all Yarn-related files BEFORE install
COPY package.json yarn.lock .yarnrc.yml .pnp.* .yarn/ ./

# Install dependencies using Yarn Plug'n'Play
RUN yarn install --immutable

# Copy the rest of your app source code
COPY . .

# Expose the app port
EXPOSE 3000

# Run app in dev mode
CMD ["yarn", "start:dev"]