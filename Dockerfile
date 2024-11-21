# Use the official Node.js LTS image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application files
COPY . .

# Expose the application's port
EXPOSE 5002

# Start the application
CMD ["node", "app.js"]
