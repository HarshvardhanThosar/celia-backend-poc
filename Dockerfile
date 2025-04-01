# Use Node.js base image
# or any Node >=16.9 for Corepack support
FROM node:22.14.0 

# Enable Corepack and prepare Yarn 4
RUN corepack enable && corepack prepare yarn@4.7.0 --activate

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies using Yarn 4 (Berry)
RUN yarn install --immutable

# Optionally install Nest CLI globally (not required if using `npx`)
# Yarn 4 discourages global installs, so we prefer `npx nest` instead
# RUN yarn global add @nestjs/cli

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 3000

# Run dev server
CMD ["yarn", "start:dev"]