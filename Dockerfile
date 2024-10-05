# Use Node.js 20.18.0 as the base image
FROM node:20.18.0

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Expose the port your app will run on (3000 in this case)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]