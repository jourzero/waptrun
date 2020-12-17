# Force node:12 to avoid issue with node:14: "Accessing non-existent property XXX of module exports inside circular dependency"
#FROM node:12  # equiv. to 12.20.0-stretch which has many vulns
FROM node:12-buster-slim

# Create app directory
WORKDIR /app

RUN apt-get -y update && apt-get -y upgrade

# Copy local source to /app
COPY . .

# Get node modules
RUN npm install

EXPOSE 5000
EXPOSE 9230
CMD npm start
