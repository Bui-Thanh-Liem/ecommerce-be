# !/bin/bash

DB_USER="root"
DB_PASSWORD="root"
DB_NAME="shop_dev"
BACKUP_FILE="backup.sql"
CONTAINER_NAME="postgres-local"

# Tạo container PostgreSQL
docker run --name ${CONTAINER_NAME} \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=${DB_PASSWORD} \
  -e POSTGRES_USER=${DB_USER} \
  -d postgres

# ===============================================

# Đăng nhập PostgreSQL (database mặc định)
docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres

# Đăng nhập database ${DB_NAME}
docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}

# Export database từ container ra host
docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}

# Export database vào file trong container
docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} -f /tmp/${BACKUP_FILE}

# Copy file backup từ container ra host
docker cp ${CONTAINER_NAME}:/tmp/${BACKUP_FILE} ./${BACKUP_FILE}

# Restore file backup.sql từ host vào database ${DB_NAME} trong container
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < ${BACKUP_FILE}

# Hoặc
cat ${BACKUP_FILE} | docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}

# 
npx typeorm migration:create src/migrations/unaccent

# Cài đặt k6 để chạy load test
brew install k6
k6 run --summary-export=result.json script.js
k6 run -o experimental-prometheus-rw=http://localhost:9090/api/v1/write test-brands.js

# 
npm install prom-client