#!/bin/bash
set -x

# Restart container and tail logs
docker restart waptrun 2>&1
docker logs -f waptrun 