export enum InventoryStockType {
  AVAILABLE = 'available', // Tồn kho có thể bán được
  RESERVED = 'reserved', // Tồn kho đã được đặt trước nhưng chưa hoàn tất giao dịch
  DAMAGED = 'damaged', // Tồn kho bị hư hỏng, không thể bán được
}
