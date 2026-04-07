-- 
REVOKE CONNECT ON DATABASE shop FROM PUBLIC;

-- Kết thúc tất cả các kết nối đến cơ sở dữ liệu shop
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'shop'
  AND pid <> pg_backend_pid();