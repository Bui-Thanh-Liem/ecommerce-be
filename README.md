# ecommerce-be

## Mô tả tổng quan

Đây là hệ thống backend cho nền tảng thương mại điện tử được xây dựng với NestJS + TypeScript. Dự án cung cấp các API phục vụ đầy đủ cho quy trình kinh doanh từ người dùng tới quản trị, vận hành kho, đơn hàng, và tích hợp thanh toán. 

## Các tính năng nổi bật

- Quản lý sản phẩm:
  - Sản phẩm, biến thể (SKU), số serial
  - Ảnh sản phẩm, thương hiệu, danh mục

- Quản lý kho và tồn kho:
  - Theo dõi số lượng hàng hóa, cập nhật tồn kho theo realtime

- Quản lý người dùng & phân quyền:
  - Đăng ký, đăng nhập, phân quyền (role, permission)
  - Hỗ trợ nhiều loại người dùng: khách hàng, nhân viên, quản lý

- Quản lý đơn hàng:
  - Tạo, cập nhật, theo dõi trạng thái đơn hàng
  - Quản lý các mặt hàng trong đơn (order items)

- Quản lý giỏ hàng (Cart):
  - Tạo và chỉnh sửa giỏ hàng, quản lý các mặt hàng trong giỏ

- Tích hợp và xử lý thanh toán:
  - Hỗ trợ các cổng thanh toán phổ biến tại VN: MoMo, VNPAY, ZaloPay

- Quản lý khuyến mãi (Promotions/Campaigns/Vouchers):
  - Tạo chương trình khuyến mãi, áp dụng voucher, campaign marketing

- Đánh giá (Rating), quản lý phản hồi từ người dùng

- Quản lý ảnh với AWS S3

- Các module bổ trợ: Nhóm nhân viên (teams), navbar động, quản lý khu vực địa lý, ...

## Công nghệ sử dụng

- **NestJS**: Framework Node.js mạnh mẽ với TypeScript cho phát triển backend hiện đại.
- **TypeScript**: Ngôn ngữ lập trình mở rộng từ JavaScript, tăng tính an toàn và tối ưu phát triển.
- **TypeORM**: ORM cho truy cập database và mapping object dễ dàng, sử dụng PostgreSQL hoặc SQLite.
- **PostgreSQL / SQLite**: Database phục vụ lưu trữ và truy vấn dữ liệu chính.
- **AWS S3 SDK**: Lưu trữ ảnh và file trên đám mây Amazon S3.
- **Passport**: Hỗ trợ xác thực đa dạng (JWT, Facebook, Google, Local).
- **Multer**: Xử lý upload file.
- **Các cổng thanh toán tích hợp**: MoMo, VNPAY, ZaloPay.
- **Các thư viện khác**:
  - class-validator, class-transformer (validate dữ liệu)
  - dotenv, cross-env (quản lý môi trường)
  - winston (log)
  - rxjs (xử lý bất đồng bộ)

## Cài đặt và chạy dự án

```bash
# Cài đặt package
npm install

# Chạy chế độ phát triển
npm run start:dev

# Hoặc build và chạy server
npm run build
npm run start:prod
```

## Cấu trúc dự án (tiêu biểu)

- `src/modules`: Các module tách biệt theo chức năng (user, products, orders, payments, promotions, ...)
- `src/guards`, `src/interceptors`, `src/exception-filters`: Bảo vệ route, xử lý lỗi và interceptor cho logic nghiệp vụ
- `src/configs`: Các file cấu hình kết nối database, aws, biến môi trường...

## Đóng góp

Để đóng góp hoặc cần thêm thông tin, vui lòng tạo issue hoặc PR trên repo này.

---

**Repo:** [Bui-Thanh-Liem/ecommerce-be](https://github.com/Bui-Thanh-Liem/ecommerce-be)