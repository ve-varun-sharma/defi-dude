FROM node:18.17.0-slim AS base

# Set the working directory inside the container to /app.
# We need to set the working directory so Docker knows where to run the commands.
WORKDIR /app

# Globally install the package manager pnpm.
RUN npm i -g pnpm

# Copy the package.json and pnpm-lock.yaml files to the working directory in the container.
# This command is necessary for Docker to install project dependencies.
COPY package.json pnpm-lock.yaml ./

# Install project dependencies using pnpm.
RUN pnpm install

# Copy all files from the context directory (where the Dockerfile is located) to the working directory in the container.
COPY . .

# Run the project build command using pnpm.
RUN pnpm build


EXPOSE $PORT
# Define the default command to be executed when the container is started with pnpm start.
CMD ["pnpm", "start"]
