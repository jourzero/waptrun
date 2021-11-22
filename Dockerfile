# Force node:12 to avoid issue with node:14: "Accessing non-existent property XXX of module exports inside circular dependency"
#FROM node:12  # equiv. to 12.20.0-stretch which has many vulns
#FROM node:12-buster-slim
FROM node:16.13.0-bullseye-slim
RUN apt-get -y update && apt-get -y upgrade

### Install MongoDB Community Edition ###
# Ref.: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/
RUN apt-get -y install wget gnupg lsof curl procps iproute2 zip xsltproc
RUN wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
RUN echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/5.0 main" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
RUN apt-get -y update
RUN apt-get install -y mongodb-org
COPY utils/etc_initd_mongod /etc/init.d/mongod
COPY utils/etc_mongod.conf /etc/mongod.conf
RUN chmod 755 /etc/init.d/mongod 
RUN chmod 644 /etc/mongod.conf

# Initialize Mongodb
RUN mkdir -p /data/db /data/configdb && chown -R mongodb:mongodb /data/db /data/configdb
#RUN mongod --config /etc/mongod.conf
#RUN service mongod start
#RUN mongo --eval 'db.runCommand({ connectionStatus: 1 })'
#RUN /usr/bin/mongorestore --db=waptrunner --drop --host 127.0.0.1:27017 /app/dbinit/waptrunner
#RUN /usr/bin/mongorestore --db=waptrunner --drop /app/dbinit/waptrunner

# Create app directory
WORKDIR /app

# Copy local source to /app
COPY . .

# Get node modules
RUN npm install

# Expose Node app, Node remote debugging and Mongodb
EXPOSE 5000
EXPOSE 9230
EXPOSE 27017
#CMD npm start
CMD ./entrypoint.sh