export enum TeamCategoryCode {
  // --- NHÓM QUẢN TRỊ (HEADQUARTER) ---
  ADMINISTRATION = 'administration', // Hành chính, nhân sự tổng
  STRATEGIC_PLANNING = 'strategic_planning', // Ban chiến lược
  CENTRAL_PURCHASING = 'central_purchasing', // Thu mua (làm việc với các hãng Samsung, Apple...)

  // --- NHÓM KINH DOANH & MARKETING ---
  SALES = 'sales', // Bán hàng (đội cầm doanh số)
  MARKETING = 'marketing', // Chạy quảng cáo, chương trình khuyến mãi
  CUSTOMER_SERVICE = 'customer_service', // Chăm sóc khách hàng, tổng đài

  // --- NHÓM VẬN HÀNH & KHO (LOGISTICS) ---
  WAREHOUSE = 'warehouse', // Quản lý kho (tồn kho, nhập xuất)
  DELIVERY = 'delivery', // Đội giao hàng
  TECHNICAL_FIX = 'technical_fix', // Đội kỹ thuật, lắp đặt, bảo hành

  // --- NHÓM TÀI CHÍNH ---
  ACCOUNTING = 'accounting', // Kế toán, kiểm soát dòng tiền
}
