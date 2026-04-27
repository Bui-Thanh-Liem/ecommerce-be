export enum ProductStatus {
  ACTIVE = 'active', // Sản phẩm đang hoạt động và có thể bán
  DISCONTINUED = 'discontinued', // Sản phẩm đã ngừng kinh doanh, không còn bán nữa nhưng vẫn giữ lại để tham chiếu lịch sử
  OUT_OF_STOCK = 'out_of_stock', // Sản phẩm hết hàng
  DRAFT = 'draft', // Sản phẩm đang trong quá trình tạo hoặc chỉnh sửa, chưa sẵn sàng để bán
}
