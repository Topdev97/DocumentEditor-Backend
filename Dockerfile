# Use the official Node.js 20 image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Install application dependencies
COPY package*.json ./
RUN npm install

# Expose the port the app runs in
EXPOSE 8080

# Define the command to run the app
CMD [ "npm", "run", "start" ]

