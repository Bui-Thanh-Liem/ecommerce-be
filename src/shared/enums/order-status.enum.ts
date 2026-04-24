export enum OrderStatus {
  PENDING = 'pending', // Đơn hàng đang chờ xử lý, chưa được xác nhận
  CONFIRM = 'confirmed', // Đơn hàng đã được xác nhận bởi người bán, đang chờ xử lý tiếp theo
  SHIPPING = 'shipping', // Đơn hàng đang được vận chuyển đến khách hàng
  DELIVERING = 'delivering', // Đơn hàng đang được giao đến khách hàng, có thể đã được giao một phần hoặc đang trong quá trình giao hàng
  CANCELED = 'canceled', // Đơn hàng đã bị hủy bởi khách hàng hoặc người bán, không còn hiệu lực
  SUCCESS = 'success', // Đơn hàng đã được giao thành công đến khách hàng và hoàn tất quá trình mua bán
}
