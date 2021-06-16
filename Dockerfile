# Force node:12 to avoid issue with node:14: "Accessing non-existent property XXX of module exports inside circular dependency"
#FROM node:12  # equiv. to 12.20.0-stretch which has many vulns
FROM node:12-buster-slim

# Create app directory
WORKDIR /app

RUN apt-get -y update && apt-get -y upgrade

## Add packages needed by az CLI
#RUN apt-get -yqq update && apt-get -yqq dist-upgrade 
#RUN apt-get -y install ca-certificates curl apt-transport-https lsb-release gnupg
#RUN curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /etc/apt/trusted.gpg.d/microsoft.gpg
#RUN echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" > /etc/apt/sources.list.d/azure-cli.list
#RUN apt-get -yqq update
#RUN apt-get -y install azure-cli

# Copy local source to /app
COPY . .

# Get node modules
RUN npm install

EXPOSE 5000
EXPOSE 9230
CMD npm start
