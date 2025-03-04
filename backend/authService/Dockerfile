# Use Alpine-based Node.js for a lightweight image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package.json package-lock.json ./

# Install dependencies (only production dependencies to keep it lightweight)
RUN npm install --only=production

# Copy the rest of the application files
COPY . .

# Expose the port the service runs on
EXPOSE 5000

# Define the command to run the service
CMD ["node", "index.js"]

