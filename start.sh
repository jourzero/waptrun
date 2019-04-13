#!/bin/bash
APP_IMG_NAME="waptr"
DB_IMG_NAME="waptrdb"

echo -e "\n"
read -p "Build image? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker-compose build
fi

echo -e "\n"
read -p "Start app with docker-compose? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker-compose up -d 
fi

echo -e "\n"
read -p "List running containers? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker container ls
fi

echo -e "\n"
read -p "View logs from running container for $APP_IMG_NAME? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker logs -f "$APP_IMG_NAME"
fi

echo -e "\n"
read -p "Open shell in running container for $APP_IMG_NAME? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker exec -it "$APP_IMG_NAME" /bin/sh
fi

echo -e "\n"
read -p "Open shell in database container? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker exec -it "$DB_IMG_NAME" /bin/sh
fi
