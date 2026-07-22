export interface StoreInventoryDetail {
  storeId: string;
  storeName: string;
  availableQuantity: number;
  isSufficient: boolean; // store này có đủ đáp ứng quantityOrdered không
  shortage: number; // số lượng còn thiếu (0 nếu đủ)
}

export interface CheckInventoryResult {
  isAvailable: boolean; // kết quả tổng: có thể đáp ứng đơn hàng không
  variantId: string;
  quantityOrdered: number;
  totalAvailableQuantity: number; // tổng tồn kho (cộng dồn các store liên quan)
  details: StoreInventoryDetail[]; // chi tiết từng store có tồn kho
  outOfStockStores: StoreInventoryDetail[]; // các store KHÔNG đủ hàng
}
