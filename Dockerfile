FROM node:current

# Create app directory
WORKDIR /app

# Copy local source to /app
COPY . .

# Get node modules
RUN npm install
RUN npm install -g nodemon

EXPOSE 5000
CMD npm start
