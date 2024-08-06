# Use the official Node.js image based on Ubuntu
FROM node:22

# Create and change to the app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the app code
COPY . .

# Expose the port Vite uses
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]

