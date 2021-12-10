# Pin to stable/slim/LTS version of node.js 
FROM node:16.13.0-bullseye-slim
RUN apt-get -y update && apt-get -y upgrade

# Add dependencies for sqlite3
RUN apt-get -y install build-essential python3 sqlite3
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 2

# Add some tools
RUN apt-get -y install wget gnupg lsof curl procps iproute2 zip xsltproc git

# Set workdir to app root
WORKDIR /app

# Make the node user the app owner
RUN chown node:node /app

# Set active user
USER node

# Get Dev vs Prod environment value
ARG WAPTRUN_ENV
ENV WAPTRUN_ENV=${WAPTRUN_ENV}

# Expose Node app and Node remote debugging
EXPOSE 9230
EXPOSE 5000
CMD ./utils/entrypoint.sh