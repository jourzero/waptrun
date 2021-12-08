FROM node:16.13.0-bullseye-slim
RUN apt-get -y update && apt-get -y upgrade

# Add dependencies for sqlite3
RUN apt-get -y install build-essential python3 sqlite3
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 2

# Add some tools
RUN apt-get -y install wget gnupg lsof curl procps iproute2 zip xsltproc 

# Upgrade NPM
RUN npm install -g npm@8.1.4

# Copy project files to /app
WORKDIR /app
COPY . .

# Set perms to allow npm install from lower-privileged user
RUN chown -R node /app

# Set active user
USER node

# Get node modules
RUN npm install

# Expose Node app, Node remote debugging and Mongodb
EXPOSE 9230
EXPOSE 27017
EXPOSE 5000
#CMD npm start
CMD ./entrypoint.sh