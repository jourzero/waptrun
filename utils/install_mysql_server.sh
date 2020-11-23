#!/bin/bash
set -x
SVC_NAME="app"
CMD[0]="apt-get install mysql-server"
CMD[1]="service mysql start"
CMD[2]="service mysql status"
CMD[3]="mysql < /app/utils/create_mysql_tester.sql"

read -p "This will install and configure mysql server in the app container. Proceed? [n] " answer
if [ "$answer" = y ];then
  for i in $(seq 0 3);do
    echo -e "\n"
    read -p "-- Execute this in container ${CONTAINER_NAME}: ${CMD[$i]} ? [n] " answer
    if [ "$answer" = y ];then
      docker-compose exec "$SVC_NAME" ${CMD[$i]}
    fi
  done
fi