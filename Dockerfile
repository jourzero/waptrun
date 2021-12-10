FROM node:16.13.0-bullseye-slim
RUN apt-get -y update && apt-get -y upgrade

# Add dependencies for sqlite3
RUN apt-get -y install build-essential python3 sqlite3
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 2

# Add some tools
RUN apt-get -y install wget gnupg lsof curl procps iproute2 zip xsltproc git

# Upgrade NPM
#RUN npm install -g npm@8.2.0

# Copy project files to /app
WORKDIR /app
COPY --chown=node:node . .
RUN chown node:node /app

# Set active user
USER node

# Get node modules
RUN npm install

# Expose Node app and Node remote debugging
EXPOSE 9230
EXPOSE 5000
#CMD npm start
CMD ./entrypoint.sh