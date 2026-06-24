-- /sql

-- Thu hồi quyền CONNECT trên cơ sở dữ liệu shop_dev từ PUBLIC
REVOKE CONNECT ON DATABASE shop_dev FROM PUBLIC;

-- Kết thúc tất cả các kết nối đến cơ sở dữ liệu shop_dev
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'shop_dev'
  AND pid <> pg_backend_pid();


-- Tạo sequence cho SKU
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Lấy giá trị tiếp theo từ sequence
-- const queryResult = await query<{ val: string }[]>("SELECT nextval('order_number_seq') as val");
-- const nextSeq = Number(queryResult[0].val);

-- 
CREATE EXTENSION IF NOT EXISTS unaccent;
SELECT * FROM pg_extension;

-- 
CREATE INDEX idx_product_variant_sales_attributes_gin ON product_variant USING gin (sales_attributes);
