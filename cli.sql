-- /sql

-- Thu hồi quyền CONNECT trên cơ sở dữ liệu shop_dev từ PUBLIC
REVOKE CONNECT ON DATABASE shop_dev FROM PUBLIC;

-- Kết thúc tất cả các kết nối đến cơ sở dữ liệu shop_dev
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'shop_dev'
  AND pid <> pg_backend_pid();


-- Tạo sequence cho product_spu_id
CREATE SEQUENCE IF NOT EXISTS product_spu_seq;