#!/bin/bash
IMG_NAME="pcderic/waptr"

echo -e "\n"
read -p "Build $IMG_NAME image? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker build -t pcderic/waptr .
fi

echo -e "\n"
read -p "Run $IMG_NAME image? [y] " answer
CID=""
if [ "$answer" = y -o "$answer" = "" ];then
  docker run -p 127.0.0.1:5000:5000 -d pcderic/waptr 
fi

echo -e "\n"
read -p "List running containers? [y] " answer
CID=""
if [ "$answer" = y -o "$answer" = "" ];then
  docker container ls
fi
CID=$(docker container ls | grep 'pcderic/waptr' | awk '{print $1}')

echo -e "\n"
read -p "View logs from running container for $IMG_NAME ($CID)? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker logs "$CID" 
fi

echo -e "\n"
read -p "Open shell in running container for $IMG_NAME ($CID)? [y] " answer
if [ "$answer" = y -o "$answer" = "" ];then
  docker exec -it "$CID" /bin/sh
fi


