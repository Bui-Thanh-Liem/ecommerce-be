# Tài Liệu Tính Năng - Nền Tảng Thương Mại Điện Tử Backend

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Các Tính Năng Chính](#các-tính-năng-chính)
4. [API Endpoints](#api-endpoints)
5. [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
6. [Bảo Mật và Xác Thực](#bảo-mật-và-xác-thực)

---

## Tổng Quan

Hệ thống backend cho nền tảng thương mại điện tử được xây dựng bằng **NestJS** và **TypeScript**. Đây là một giải pháp toàn diện cho các hoạt động thương mại điện tử, từ quản lý sản phẩm, kho hàng, đơn hàng đến xử lý thanh toán và quản lý khuyến mãi.

### Đặc Điểm Nổi Bật:

- **Kiến Trúc Modular**: Tách biệt các chức năng theo module độc lập
- **Xác Thực Đa Chiều**: Hỗ trợ JWT, Passport (Local, Google, Facebook)
- **Quản Lý Quyền Chi Tiết**: Role-based access control (RBAC)
- **Tích Hợp Thanh Toán**: MoMo, VNPAY, ZaloPay
- **Xử Lý Hình Ảnh**: AWS S3 và Cloudinary
- **Lưu Trữ Dữ Liệu**: PostgreSQL
- **Cache và Queue**: Redis với BullMQ

---

## Kiến Trúc Hệ Thống

### Cấu Trúc Thư Mục

```
src/
├── modules/                    # Các module chính của ứng dụng
│   ├── auth/                   # Module xác thực
│   ├── catalog/                # Quản lý sản phẩm (Products, Categories, Brands)
│   ├── customer/               # Quản lý khách hàng (Orders, Carts, Ratings)
│   ├── inventory/              # Quản lý kho (Inventories, Stores)
│   ├── management/             # Quản lý hệ thống (Staffs, Roles, Permissions)
│   ├── payments/               # Xử lý thanh toán (MoMo, VNPAY, ZaloPay, Vouchers)
│   └── campaign/               # Quản lý khuyến mãi (Promotions, Campaigns)
├── common/                     # Các thành phần dùng chung
│   ├── s3/                     # Dịch vụ AWS S3
│   ├── cloudinary/             # Dịch vụ Cloudinary
│   └── cache/                  # Dịch vụ Cache
├── shared/                     # Chia sẻ cho toàn ứng dụng
│   ├── enums/                  # Định nghĩa enum
│   ├── dtos/                   # Data Transfer Objects
│   ├── entities/               # Entity cơ sở dữ liệu
│   └── interfaces/             # Giao diện TypeScript
├── guards/                     # Bảo vệ route
│   ├── auth.guard.ts           # JWT authentication
│   ├── role.guard.ts           # Role-based authorization
│   └── api.guard.ts            # API key validation
├── strategies/                 # Passport strategies
├── interceptors/               # Xử lý request/response
├── pipes/                      # Validation pipes
├── decorators/                 # Custom decorators
├── exception-filters/          # Xử lý lỗi toàn cầu
├── configs/                    # Cấu hình ứng dụng
├── db/                         # Cấu hình database
├── migrations/                 # Database migrations
├── logger/                     # Hệ thống logging
└── utils/                      # Các hàm tiện ích
```

### Các Layer Chính

1. **Controllers**: Tiếp nhận HTTP request
2. **Services**: Xử lý business logic
3. **Repositories**: Tương tác với database
4. **DTOs**: Định dạng dữ liệu input/output
5. **Entities**: Cấu trúc dữ liệu database
6. **Guards/Interceptors**: Bảo mật và middleware
7. **Pipes**: Validation dữ liệu

---

## Các Tính Năng Chính

### 1. **Module Xác Thực (Auth Module)**

#### Chức Năng Chính:

- **Đăng Nhập Nhân Viên (Local)**: Sử dụng phone/email và password
- **Xác Thực OAuth**: Hỗ trợ Google OAuth và Facebook Login
- **Quản Lý Token**: Tạo, làm mới, và hủy bỏ JWT tokens
- **Bảo Mật Mật Khẩu**: Mã hóa bcrypt, so sánh an toàn

#### Endpoints Chính:

- `POST /auth/login` - Đăng nhập bằng phone/password
- `POST /auth/refresh` - Làm mới JWT token
- `POST /auth/logout` - Đăng xuất
- `GET /auth/google` - Google OAuth callback
- `GET /auth/facebook` - Facebook OAuth callback

#### Entities:

- `StaffEntity`: Thông tin nhân viên
- `StaffTokenEntity`: Quản lý tokens của nhân viên

---

### 2. **Module Quản Lý Sản Phẩm (Catalog Module)**

#### 2.1 Sản Phẩm Chính (Products - SPU)

**Mô Tả**: Lưu trữ thông tin sản phẩm cơ bản (Standard Product Unit)

**Chức Năng**:

- Tạo, đọc, cập nhật, xóa sản phẩm
- Liên kết danh mục (Category) và thương hiệu (Brand)
- Tạo mã SPU tự động dựa trên danh mục + thương hiệu + mã hàng
- Quản lý slug cho URL thân thiện
- Hỗ trợ trạng thái sản phẩm: ACTIVE, INACTIVE, DISCONTINUED
- Quản lý ảnh sản phẩm liên quan

**Entities**:

- `ProductEntity`: Thông tin sản phẩm SPU

**Endpoints**:

- `GET /products` - Danh sách sản phẩm (phân trang)
- `POST /products` - Tạo sản phẩm mới
- `GET /products/:id` - Chi tiết sản phẩm
- `PATCH /products/:id` - Cập nhật sản phẩm
- `DELETE /products/:id` - Xóa sản phẩm

---

#### 2.2 Biến Thể Sản Phẩm (Product Variants - SKU)

**Mô Tả**: Lưu trữ các biến thể của sản phẩm (kích thước, màu sắc, v.v.) - Stock Keeping Unit

**Chức Năng**:

- Tạo nhiều SKU cho một SPU
- Tạo mã SKU tự động dựa trên SPU + thuộc tính bán hàng
- Quản lý giá bán, giá gốc
- Thuộc tính bán hàng (salesAttributes): Màu sắc, kích thước, v.v.
- Quản lý tình trạng: NEW, REFURBISHED, USED
- Gắn ảnh sản phẩm

**Entities**:

- `ProductVariantEntity`: Thông tin biến thể SKU

**Endpoints**:

- `GET /product-variants` - Danh sách biến thể
- `POST /product-variants` - Tạo biến thể
- `GET /product-variants/:id` - Chi tiết biến thể
- `PATCH /product-variants/:id` - Cập nhật biến thể
- `DELETE /product-variants/:id` - Xóa biến thể

---

#### 2.3 Mục Hàng (Product Items - SERIAL)

**Mô Tả**: Lưu trữ từng cái hàng riêng lẻ với serial number - vật lý trong kho

**Chức Năng**:

- Tạo mục hàng riêng lẻ cho mỗi sản phẩm vật lý
- Mã hóa SERIAL tự động
- Quản lý tình trạng hàng: IN_STOCK, SOLD, DAMAGED, LOST
- Gắn liền với SKU cụ thể
- Theo dõi từng sản phẩm vật lý

**Entities**:

- `ProductItemEntity`: Thông tin mục hàng với SERIAL

**Endpoints**:

- `GET /product-items` - Danh sách mục hàng
- `POST /product-items` - Tạo mục hàng
- `GET /product-items/:id` - Chi tiết mục hàng
- `PATCH /product-items/:id` - Cập nhật mục hàng
- `DELETE /product-items/:id` - Xóa mục hàng

---

#### 2.4 Danh Mục Sản Phẩm (Categories)

**Chức Năng**:

- Tạo danh mục phân cấp (category tree)
- Quản lý code danh mục duy nhất
- Gắn ảnh đại diện danh mục
- Sắp xếp và ẩn/hiển thị danh mục

**Endpoints**:

- `GET /categories` - Danh sách danh mục
- `POST /categories` - Tạo danh mục
- `PATCH /categories/:id` - Cập nhật danh mục
- `DELETE /categories/:id` - Xóa danh mục

---

#### 2.5 Thương Hiệu (Brands)

**Chức Năng**:

- Quản lý thương hiệu
- Mã brand duy nhất
- Gắn logo/hình ảnh thương hiệu

**Endpoints**:

- `GET /brands` - Danh sách thương hiệu
- `POST /brands` - Tạo thương hiệu
- `PATCH /brands/:id` - Cập nhật thương hiệu
- `DELETE /brands/:id` - Xóa thương hiệu

---

#### 2.6 Hình Ảnh Sản Phẩm (Product Images)

**Chức Năng**:

- Quản lý ảnh cho sản phẩm/biến thể
- Tải lên AWS S3 hoặc Cloudinary
- Tạo presigned URLs để tải xuống an toàn
- Đánh dấu ảnh thumbnail
- Sắp xếp thứ tự ảnh

**Endpoints**:

- `GET /product-images` - Danh sách ảnh
- `POST /product-images` - Tải lên ảnh
- `DELETE /product-images/:id` - Xóa ảnh

---

#### 2.7 Navbar Sản Phẩm (Product Navbar)

**Chức Năng**:

- Quản lý navigation menu động cho frontend
- Gắn sản phẩm với menu items
- Sắp xếp menu items

---

### 3. **Module Quản Lý Kho (Inventory Module)**

#### 3.1 Kho Hàng (Inventories)

**Mô Tả**: Theo dõi tồn kho theo cửa hàng và biến thể sản phẩm

**Chức Năng**:

- Quản lý số lượng hàng tồn
- Mức cảnh báo tồn kho thấp (minStockLevel)
- Loại tồn kho: AVAILABLE, RESERVED, DAMAGED
- Cập nhật tồn kho theo thời gian thực
- Hỗ trợ transaction để tránh race condition
- Phân trang và lọc theo cửa hàng/sản phẩm

**Entities**:

- `InventoryEntity`: Thông tin tồn kho

**Endpoints**:

- `GET /inventories` - Danh sách tồn kho (phân trang)
- `POST /inventories` - Tạo tồn kho
- `GET /inventories/:id` - Chi tiết tồn kho
- `PATCH /inventories/:id` - Cập nhật tồn kho
- `DELETE /inventories/:id` - Xóa tồn kho

---

#### 3.2 Cửa Hàng (Stores)

**Mô Tả**: Quản lý các cửa hàng/warehouse

**Chức Năng**:

- Tạo cửa hàng/warehouse
- Quản lý địa chỉ cửa hàng
- Liên kết với nhân viên làm việc

**Endpoints**:

- `GET /stores` - Danh sách cửa hàng
- `POST /stores` - Tạo cửa hàng
- `PATCH /stores/:id` - Cập nhật cửa hàng
- `DELETE /stores/:id` - Xóa cửa hàng

---

#### 3.3 Khu Vực Địa Lý (Location Regions)

**Mô Tả**: Quản lý khu vực địa lý (Tỉnh, Huyện, v.v.)

**Chức Năng**:

- Quản lý bộ máy địa lý phân cấp
- Loại khu vực: PROVINCE, DISTRICT, WARD
- Tính phí vận chuyển theo khu vực

**Endpoints**:

- `GET /location-regions` - Danh sách khu vực
- `POST /location-regions` - Tạo khu vực
- `PATCH /location-regions/:id` - Cập nhật khu vực
- `DELETE /location-regions/:id` - Xóa khu vực

---

### 4. **Module Quản Lý Khách Hàng (Customer Module)**

#### 4.1 Khách Hàng (Customers)

**Mô Tả**: Quản lý thông tin khách hàng

**Chức Năng**:

- Đăng ký khách hàng mới
- Quản lý thông tin cá nhân (tên, phone, email)
- Quản lý địa chỉ giao hàng
- Lưu trữ sở thích/yêu thích

**Endpoints**:

- `GET /customers` - Danh sách khách hàng
- `POST /customers` - Tạo khách hàng
- `GET /customers/:id` - Chi tiết khách hàng
- `PATCH /customers/:id` - Cập nhật khách hàng

---

#### 4.2 Giỏ Hàng (Carts)

**Mô Tả**: Quản lý giỏ hàng của khách hàng (guest hoặc đã đăng nhập)

**Chức Năng**:

- Tạo giỏ hàng cho guest (qua session ID)
- Tạo giỏ hàng cho khách hàng đã đăng nhập
- Trạng thái giỏ: ACTIVE, ABANDONED, CONVERTED_TO_ORDER
- **Merge carts**: Khi khách guest đăng nhập, gộp giỏ guest vào giỏ của khách
  - Nếu item trùng: Cộng số lượng
  - Nếu item khác: Chuyển sang giỏ khách
  - Xóa giỏ guest sau khi merge
- Hỗ trợ pessimistic locking để tránh race condition

**Entities**:

- `CartEntity`: Thông tin giỏ hàng
- `CartItemEntity`: Mục hàng trong giỏ

**Endpoints**:

- `GET /carts` - Danh sách giỏ hàng
- `POST /carts` - Tạo giỏ hàng
- `GET /carts/:id` - Chi tiết giỏ hàng
- `PATCH /carts/:id` - Cập nhật trạng thái giỏ
- `POST /carts/merge` - Gộp giỏ (guest + customer)
- `DELETE /carts/:id` - Xóa giỏ hàng

---

#### 4.3 Mục Hàng Giỏ (Cart Items)

**Chức Năng**:

- Thêm sản phẩm vào giỏ
- Cập nhật số lượng
- Xóa sản phẩm khỏi giỏ
- Tính giá trị giỏ hàng

**Endpoints**:

- `GET /cart-items` - Danh sách mục giỏ
- `POST /cart-items` - Thêm mục vào giỏ
- `PATCH /cart-items/:id` - Cập nhật mục giỏ
- `DELETE /cart-items/:id` - Xóa mục khỏi giỏ

---

#### 4.4 Đơn Hàng (Orders)

**Mô Tả**: Quản lý đơn hàng từ khách hàng

**Chức Năng**:

- Tạo đơn hàng từ giỏ hàng
- Tạo số đơn hàng duy nhất tự động (sử dụng sequence)
- Quản lý trạng thái đơn hàng:
  - PENDING: Đợi thanh toán
  - PROCESSING: Đang xử lý
  - SHIPPED: Đã gửi
  - DELIVERED: Đã giao
  - CANCELLED: Hủy
  - RETURNED: Trả lại
- Quản lý phương thức thanh toán:
  - CASH_ON_DELIVERY
  - CREDIT_CARD
  - MOMO
  - VNPAY
  - ZALOPAY
- Tính toán tổng giá trị đơn hàng (bao gồm giảm giá, phí vận chuyển)
- Gửi email/SMS thông báo

**Entities**:

- `OrderEntity`: Thông tin đơn hàng

**Endpoints**:

- `GET /orders` - Danh sách đơn hàng (phân trang)
- `POST /orders` - Tạo đơn hàng
- `GET /orders/:id` - Chi tiết đơn hàng
- `PATCH /orders/:id` - Cập nhật trạng thái đơn hàng
- `DELETE /orders/:id` - Hủy đơn hàng

---

#### 4.5 Mục Hàng Đơn (Order Items)

**Chức Năng**:

- Quản lý từng sản phẩm trong đơn hàng
- Lưu trữ thông tin giá/khuyến mãi tại thời điểm đặt hàng
- Cập nhật trạng thái mục hàng

**Endpoints**:

- `GET /order-items` - Danh sách mục đơn hàng
- `GET /order-items/:id` - Chi tiết mục hàng
- `PATCH /order-items/:id` - Cập nhật mục hàng

---

#### 4.6 Đánh Giá & Xếp Hạng (Rating)

**Mô Tả**: Cho phép khách hàng đánh giá sản phẩm

**Chức Năng**:

- Tạo đánh giá cho sản phẩm (1-5 sao)
- Viết bình luận đánh giá
- Quản lý ảnh đánh giá
- Xóa/cập nhật đánh giá của chính mình
- Tính điểm đánh giá trung bình sản phẩm

**Entities**:

- `RatingEntity`: Thông tin đánh giá

**Endpoints**:

- `GET /ratings` - Danh sách đánh giá
- `POST /ratings` - Tạo đánh giá
- `GET /ratings/:id` - Chi tiết đánh giá
- `PATCH /ratings/:id` - Cập nhật đánh giá
- `DELETE /ratings/:id` - Xóa đánh giá

---

#### 4.7 Sản Phẩm Yêu Thích (Customer Products)

**Chức Năng**:

- Thêm/xóa sản phẩm vào danh sách yêu thích
- Xem danh sách sản phẩm yêu thích

---

### 5. **Module Thanh Toán (Payments Module)**

#### 5.1 MoMo

**Mô Tả**: Tích hợp cổng thanh toán MoMo

**Chức Năng**:

- Tạo yêu cầu thanh toán MoMo
- Tạo signature HMAC-SHA256 để bảo mật
- Hỗ trợ requestType: captureWallet, payWallet
- Nhận IPN callback từ MoMo
- Xác minh signature của callback
- Cập nhật trạng thái đơn hàng sau thanh toán

**Endpoints**:

- `POST /momo/create-payment` - Tạo đơn thanh toán MoMo
- `POST /momo/callback` - Nhận callback từ MoMo
- `GET /momo/transaction-status` - Kiểm tra trạng thái giao dịch

**Cấu Hình Cần Thiết**:

- `MOMO_ENDPOINT`: API endpoint của MoMo
- `MOMO_PARTNER_CODE`: Mã partner
- `MOMO_ACCESS_KEY`: Access key
- `MOMO_SECRET_KEY`: Secret key
- `MOMO_RETURN_URL`: URL quay lại sau thanh toán
- `MOMO_NOTIFY_URL`: URL nhận IPN notification

---

#### 5.2 VNPAY

**Mô Tả**: Tích hợp cổng thanh toán VNPAY

**Chức Năng**:

- Tạo yêu cầu thanh toán VNPAY
- Tạo checksum để bảo mật
- Nhận callback từ VNPAY
- Xác minh checksum callback
- Cập nhật trạng thái đơn hàng

**Endpoints**:

- `POST /vnpay/create-payment` - Tạo đơn thanh toán VNPAY
- `GET /vnpay/callback` - Nhận callback từ VNPAY
- `GET /vnpay/transaction-status` - Kiểm tra trạng thái

**Cấu Hình Cần Thiết**:

- `VNPAY_ENDPOINT`: API endpoint của VNPAY
- `VNPAY_MERCHANT_CODE`: Mã merchant
- `VNPAY_MERCHANT_SECRET`: Secret key
- `VNPAY_RETURN_URL`: URL quay lại

---

#### 5.3 ZaloPay

**Mô Tả**: Tích hợp cổng thanh toán ZaloPay

**Chức Năng**:

- Tạo yêu cầu thanh toán ZaloPay
- Tính toán MAC key
- Nhận callback từ ZaloPay
- Xác minh MAC key
- Cập nhật trạng thái đơn hàng

**Endpoints**:

- `POST /zalopay/create-payment` - Tạo đơn thanh toán ZaloPay
- `POST /zalopay/callback` - Nhận callback từ ZaloPay
- `GET /zalopay/transaction-status` - Kiểm tra trạng thái

---

#### 5.4 Vouchers (Phiếu Giảm Giá)

**Mô Tả**: Quản lý mã giảm giá/voucher

**Chức Năng**:

- Tạo voucher với mã duy nhất
- Quy định loại giảm giá: FIXED_AMOUNT (cố định), PERCENTAGE (%)
- Quy định phạm vi áp dụng:
  - ALL_PRODUCTS: Tất cả sản phẩm
  - SPECIFIC_PRODUCTS: Sản phẩm cụ thể
  - SPECIFIC_CATEGORIES: Danh mục cụ thể
- Quy định loại khuyến mãi:
  - ORDER_LEVEL: Giảm từ toàn đơn
  - PRODUCT_LEVEL: Giảm từng sản phẩm
- Quản lý trạng thái: ACTIVE, INACTIVE, EXPIRED
- Giới hạn số lần sử dụng (usage limit)
- Giới hạn per customer
- Ngày bắt đầu/kết thúc
- Số tiền/% giảm tối thiểu (min discount)
- Số tiền giảm tối đa (max discount)

**Endpoints**:

- `GET /vouchers` - Danh sách voucher
- `POST /vouchers` - Tạo voucher
- `GET /vouchers/:id` - Chi tiết voucher
- `PATCH /vouchers/:id` - Cập nhật voucher
- `DELETE /vouchers/:id` - Xóa voucher
- `POST /vouchers/validate` - Kiểm tra voucher có hợp lệ hay không

---

### 6. **Module Khuyến Mãi (Campaign Module)**

#### 6.1 Chiến Dịch Khuyến Mãi (Campaigns)

**Mô Tả**: Quản lý các chiến dịch marketing toàn hệ thống

**Chức Năng**:

- Tạo chiến dịch khuyến mãi
- Quản lý thời gian chiến dịch (start/end date)
- Quản lý trạng thái chiến dịch
- Gắn các promotion và voucher vào chiến dịch

**Endpoints**:

- `GET /campaigns` - Danh sách chiến dịch
- `POST /campaigns` - Tạo chiến dịch
- `GET /campaigns/:id` - Chi tiết chiến dịch
- `PATCH /campaigns/:id` - Cập nhật chiến dịch
- `DELETE /campaigns/:id` - Xóa chiến dịch

---

#### 6.2 Khuyến Mãi Sản Phẩm (Product Promotions)

**Mô Tả**: Khuyến mãi đặc biệt cho sản phẩm/biến thể cụ thể

**Chức Năng**:

- Tạo khuyến mãi cho sản phẩm cụ thể
- Gắn sản phẩm nổi bật (highlighted products)
- Quản lý phạm vi áp dụng:
  - PRODUCT_LEVEL: Áp dụng cho sản phẩm cụ thể
  - STORE_LEVEL: Áp dụng theo cửa hàng
- Quản lý loại khuyến mãi:
  - PRICE_REDUCTION: Giảm giá
  - BUY_X_GET_Y: Mua X được Y
  - BUNDLE_DEAL: Gói khuyến mãi
- Tính toán khuyến mãi tự động khi tạo đơn hàng

**Endpoints**:

- `GET /product-promotions` - Danh sách khuyến mãi sản phẩm
- `POST /product-promotions` - Tạo khuyến mãi
- `GET /product-promotions/:id` - Chi tiết khuyến mãi
- `PATCH /product-promotions/:id` - Cập nhật khuyến mãi
- `DELETE /product-promotions/:id` - Xóa khuyến mãi

---

#### 6.3 Khuyến Mãi Danh Mục (Category Promotions)

**Chức Năng**:

- Tạo khuyến mãi cho danh mục sản phẩm
- Áp dụng tự động cho tất cả sản phẩm trong danh mục
- Quản lý loại và phạm vi khuyến mãi tương tự Product Promotions

---

#### 6.4 Khuyến Mãi Chung (Promotions)

**Mô Tả**: Khuyến mãi phổ quát gắn liền với chiến dịch

**Chức Năng**:

- Liên kết với chiến dịch khuyến mãi
- Nổi bật các sản phẩm trong chiến dịch
- Quản lý trạng thái khuyến mãi

---

### 7. **Module Quản Lý Hệ Thống (Management Module)**

#### 7.1 Nhân Viên (Staffs)

**Mô Tả**: Quản lý nhân viên hệ thống

**Chức Năng**:

- Tạo tài khoản nhân viên mới
- Quản lý thông tin cá nhân (tên, email, phone)
- Quản lý status nhân viên: ACTIVE, INACTIVE
- Gắn nhân viên với cửa hàng (store)
- Gắn vai trò/quyền (roles/permissions)
- Quản lý người quản lý trực tiếp (directManager)
- Hỗ trợ upload ảnh nhân viên (Cloudinary)
- Mã hóa password bcrypt
- Khởi tạo dữ liệu mặc định khi ứng dụng start

**Entities**:

- `StaffEntity`: Thông tin nhân viên

**Endpoints**:

- `GET /staffs` - Danh sách nhân viên (phân trang)
- `POST /staffs` - Tạo nhân viên
- `GET /staffs/:id` - Chi tiết nhân viên
- `PATCH /staffs/:id` - Cập nhật nhân viên
- `DELETE /staffs/:id` - Xóa nhân viên

---

#### 7.2 Vai Trò (Roles)

**Mô Tả**: Quản lý vai trò (roles) trong hệ thống

**Chức Năng**:

- Tạo vai trò mới (ví dụ: Admin, Manager, Staff)
- Gắn permissions vào role
- Quản lý vai trò theo danh mục (RoleCategory)

**Entities**:

- `RoleEntity`: Thông tin vai trò
- `RoleCategoryEntity`: Danh mục vai trò

**Endpoints**:

- `GET /roles` - Danh sách vai trò
- `POST /roles` - Tạo vai trò
- `GET /roles/:id` - Chi tiết vai trò
- `PATCH /roles/:id` - Cập nhật vai trò
- `DELETE /roles/:id` - Xóa vai trò

---

#### 7.3 Quyền Hạn (Permissions)

**Mô Tả**: Quản lý quyền hạn chi tiết

**Chức Năng**:

- Định nghĩa quyền hạn (ví dụ: VIEW, CREATE, UPDATE, DELETE)
- Gắn quyền vào vai trò
- Kiểm tra quyền trong guards

**Entities**:

- `PermissionEntity`: Thông tin quyền hạn

**Endpoints**:

- `GET /permissions` - Danh sách quyền hạn
- `POST /permissions` - Tạo quyền hạn
- `GET /permissions/:id` - Chi tiết quyền hạn
- `PATCH /permissions/:id` - Cập nhật quyền hạn
- `DELETE /permissions/:id` - Xóa quyền hạn

---

#### 7.4 Tokens Nhân Viên (Staff Tokens)

**Mô Tả**: Quản lý JWT tokens của nhân viên

**Chức Năng**:

- Tạo JWT access token
- Quản lý refresh token
- Cập nhật token khi đăng nhập
- Xóa token khi đăng xuất
- Hỗ trợ loại token: ACCESS, REFRESH

**Entities**:

- `StaffTokenEntity`: Thông tin token

**Endpoints**:

- `GET /staff-tokens` - Danh sách token
- `POST /staff-tokens` - Tạo token
- `DELETE /staff-tokens/:id` - Xóa token

---

#### 7.5 Nhóm Nhân Viên (Teams)

**Mô Tả**: Quản lý các nhóm/bộ phận nhân viên

**Chức Năng**:

- Tạo nhóm nhân viên
- Gắn nhân viên vào nhóm
- Quản lý loại nhóm (TeamType)
- Quản lý danh mục nhóm (TeamCategory)

**Endpoints**:

- `GET /teams` - Danh sách nhóm
- `POST /teams` - Tạo nhóm
- `GET /teams/:id` - Chi tiết nhóm
- `PATCH /teams/:id` - Cập nhật nhóm
- `DELETE /teams/:id` - Xóa nhóm

---

#### 7.6 Danh Mục Nhóm (Team Categories)

**Chức Năng**:

- Quản lý danh mục cho nhóm (Sales, IT, HR, v.v.)
- Gắn nhóm vào danh mục

---

---

## API Endpoints

### Tổng Quan

- **Base URL**: `http://localhost:3001/api/v1`
- **Port Mặc Định**: 3001
- **Documentation**: `http://localhost:3001/api/document` (Swagger UI)

### Nhóm Endpoints Chính

| Module         | Endpoints                                                                          |
| -------------- | ---------------------------------------------------------------------------------- |
| **Auth**       | `/auth/*`                                                                          |
| **Products**   | `/products`, `/product-variants`, `/product-items`                                 |
| **Catalog**    | `/categories`, `/brands`, `/product-images`, `/product-navbar`                     |
| **Inventory**  | `/inventories`, `/stores`, `/location-regions`                                     |
| **Customers**  | `/customers`, `/orders`, `/order-items`                                            |
| **Carts**      | `/carts`, `/cart-items`                                                            |
| **Ratings**    | `/ratings`                                                                         |
| **Payments**   | `/momo/*`, `/vnpay/*`, `/zalopay/*`, `/vouchers`                                   |
| **Campaigns**  | `/campaigns`, `/promotions`, `/product-promotions`, `/category-promotions`         |
| **Management** | `/staffs`, `/roles`, `/permissions`, `/staff-tokens`, `/teams`, `/team-categories` |

---

## Công Nghệ Sử Dụng

### Backend Framework & Language

- **NestJS** v11.0.1 - Framework Node.js mạnh mẽ
- **TypeScript** v5.7.3 - Ngôn ngữ lập trình typed

### Database & ORM

- **PostgreSQL** - Database chính (production)
- **TypeORM** v0.3.28 - Object-Relational Mapping

### Authentication & Authorization

- **Passport** v1.0.0 - Authentication middleware
  - **passport-jwt** v4.0.1 - JWT strategy
  - **passport-local** v1.0.0 - Local strategy (username/password)
  - **passport-google-oauth20** v2.0.0 - Google OAuth
  - **passport-facebook** v3.0.0 - Facebook OAuth
- **bcrypt** v6.0.0 - Mã hóa password
- **jsonwebtoken** v9.0.3 - Tạo và xác minh JWT

### File Storage

- **AWS S3 SDK** v3.1032.0 - Lưu trữ ảnh trên AWS S3
- **Cloudinary** v2.10.0 - Dịch vụ cloud image
- **Multer** v2.1.1 - Xử lý upload file

### Caching & Queue

- **Redis** - Cache store (via @keyv/redis)
- **BullMQ** v5.77.6 - Job queue system
- **@bull-board/nestjs** v7.1.5 - Dashboard quản lý queues
- **cache-manager** v7.2.8 - Cache abstraction layer

### Validation & Transformation

- **class-validator** v0.14.4 - Validation decorators
- **class-transformer** v0.5.1 - DTO transformation

### HTTP Client

- **@nestjs/axios** v4.0.1 - HTTP client (axios wrapper)

### Logging

- **winston** v3.19.0 - Logging library
- **winston-daily-rotate-file** v5.0.0 - Rotating file appender

### Utilities

- **slugify** v1.6.9 - URL-friendly string generation
- **uuid** v14.0.0 - UUID generation
- **ms** v2.1.3 - Milliseconds conversion
- **cross-env** v10.1.0 - Cross-platform environment variables

### API Documentation

- **@nestjs/swagger** v11.3.0 - Swagger/OpenAPI documentation

### Development Tools

- **Jest** v30.3.0 - Testing framework
- **ts-jest** v29.4.9 - TypeScript support for Jest
- **ESLint** v9.18.0 - Code linter
- **Prettier** v3.4.2 - Code formatter
- **ts-node** v10.9.2 - Execute TypeScript directly

---

## Bảo Mật và Xác Thực

### 1. **JWT Authentication**

- Sử dụng access token + refresh token pattern
- Access token: Ngắn hạn (~15 phút)
- Refresh token: Dài hạn (~7 ngày)
- Lưu trữ token trong database cho việc revocation

### 2. **Password Security**

- Mã hóa bcrypt với salt rounds
- So sánh an toàn để tránh timing attack

### 3. **Role-Based Access Control (RBAC)**

- Gắn roles và permissions cho nhân viên
- Guard kiểm tra quyền trước khi xử lý request
- Decorators: `@Permission()`, `@RequireRoles()`

### 4. **Guards**

- **JwtAuthGuard**: Kiểm tra JWT token hợp lệ
- **RoleGuard**: Kiểm tra vai trò/quyền
- **ApiGuard**: Kiểm tra API key (x-api-key header)
- **PublicDecorator**: Cho phép endpoint không cần auth

### 5. **Payment Security**

- HMAC-SHA256 signature cho MoMo
- Checksum verification cho VNPAY/ZaloPay
- Verify IPN callback để tránh giả mạo
- Không lưu sensitive payment data

### 6. **CORS Configuration**

```typescript
app.enableCors({
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-api-key'],
});
```

### 7. **Data Protection**

- Validation pipes kiểm tra tất cả input
- Serializer interceptor loại bỏ sensitive fields (ví dụ: password)
- Transaction locks để tránh race condition

### 8. **Pagination Security**

- Giới hạn page size
- Validate offset/limit từ client

---

## Các Tính Năng Nâng Cao

### 1. **Transaction Management**

```typescript
// Ví dụ: mergeCarts() sử dụng database transaction
return this.dataSource.transaction(async (manager) => {
  // Tất cả hoạt động trong block này sẽ là atomic
  // Nếu có lỗi sẽ rollback tất cả
});
```

### 2. **Pessimistic Locking**

```typescript
// Khóa bản ghi để tránh race condition
lock: {
  mode: 'pessimistic_write';
}
```

### 3. **Query Optimization**

- Sử dụng eager/lazy loading theo tình huống
- Select chỉ các field cần thiết
- Join relations khi cần

### 4. **Auto-generated Codes**

- **SPU Code**: Dựa trên category + brand + model
- **SKU Code**: Dựa trên SPU + sales attributes
- **SERIAL Code**: Mã hóa riêng cho mỗi hàng vật lý
- **Order Number**: Sử dụng database sequence

### 5. **Async Queue Processing**

- BullMQ cho các tác vụ nền (email, notification, v.v.)
- Retry logic tự động
- Dashboard Bull Board để monitoring

### 6. **Middleware & Interceptors**

- **OvInterceptor**: Xử lý response một cách consistent
- **SerializerInterceptor**: Loại bỏ sensitive fields
- **GuestInterceptor**: Xác định session ID cho guest

### 7. **Exception Handling**

- ErrorExceptionFilter xử lý toàn cầu
- Custompipe validation errors
- Consistent error response format

### 8. **Logging**

- Winston logger cho production
- Daily rotating log files
- Structured logging

---

## Cấu Hình Môi Trường

### File `.env.dev` (Development)

```env
NODE_ENV=development
PORT=3001

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ecommerce

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# MoMo Payment
MOMO_ENDPOINT=https://test-payment.momo.vn/gw_payment
MOMO_PARTNER_CODE=MOMO...
MOMO_ACCESS_KEY=F8590Oc2...
MOMO_SECRET_KEY=K9...
MOMO_RETURN_URL=http://localhost:3000
MOMO_NOTIFY_URL=http://localhost:3001/api/v1/momo/callback

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

---

## Database Entities Quan Trọng

### SPU - SKU - SERIAL Hierarchy

```
Product (SPU)
  └── ProductVariant (SKU)
      └── ProductItem (SERIAL)
```

### Order Management

```
Order
  ├── OrderItem
  │   └── ProductVariant
  ├── Cart (merged from)
  └── Payment (MoMo/VNPAY/ZaloPay)
```

### Permission System

```
Staff
  ├── Role
  │   └── Permission
  └── Store
```

---

## Kết Luận

Hệ thống e-commerce backend này cung cấp một nền tảng toàn diện và chuyên nghiệp cho các nhu cầu thương mại điện tử. Với kiến trúc modular, bảo mật chặt chẽ, và tích hợp đa thanh toán, nó có khả năng scale-up để đáp ứng các yêu cầu kinh doanh phức tạp.

**Người phát triển**: Bùi Thanh Liêm  
**Repository**: https://github.com/Bui-Thanh-Liem/ecommerce-be
