# Use an official Node runtime as the parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application's code
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

# Run the app when the container launches
CMD ["node", "dist/main-script.js"]