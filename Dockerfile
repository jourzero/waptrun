FROM node:11.6-alpine

# Create app directory
WORKDIR /app

# Copy local source to /app
COPY . .

# Get node modules
RUN npm install

EXPOSE 5000
CMD npm start
