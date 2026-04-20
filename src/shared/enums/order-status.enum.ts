export enum OrderStatus {
  PENDING = 'pending', // Đơn hàng đang chờ xử lý, chưa được xác nhận
  CONFIRM = 'Confirmed', // Đơn hàng đã được xác nhận bởi người bán, đang chờ xử lý tiếp theo
  SHIPPING = 'Shipping', // Đơn hàng đang được vận chuyển đến khách hàng
  DELIVERING = 'Delivering', // Đơn hàng đang được giao đến khách hàng, có thể đã được giao một phần hoặc đang trong quá trình giao hàng
  CANCELED = 'Canceled', // Đơn hàng đã bị hủy bởi khách hàng hoặc người bán, không còn hiệu lực
  SUCCESS = 'Success', // Đơn hàng đã được giao thành công đến khách hàng và hoàn tất quá trình mua bán
}
