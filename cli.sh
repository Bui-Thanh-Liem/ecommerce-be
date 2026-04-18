# !/bin/bash

# 
docker run --name postgres-local \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=root \
  -e POSTGRES_USER=root \
  -d postgres

# 
docker exec -it postgres-local psql -U root -d postgres