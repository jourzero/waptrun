#!/bin/bash
CTR_NAME="waptr"
CMD[1]="apt-get update"
CMD[2]="apt-get install mysql-server"
CMD[3]="service mysql start"
CMD[4]="service mysql status"
CMD[5]="mysql < /app/utils/create_mysql_tester.sql"
CMD[5]="mysql"
CMD[5]="/bin/bash"
OPT[1]=""
OPT[2]=""
OPT[3]=""
OPT[4]=""
OPT[5]="-it"

read -p "This will install and configure mysql server in the app container. Proceed? [n] " answer
if [ "$answer" = y ];then
  for i in $(seq 1 5);do
    echo -e "\n"
    read -p "-- Execute this in container ${CTR_NAME}: ${CMD[$i]} ? [y] " answer
    if [ "$answer" = y -o "$answer" = "" ];then
      docker exec ${OPT[$i]} "$CTR_NAME" ${CMD[$i]}
    fi
  done
fi
