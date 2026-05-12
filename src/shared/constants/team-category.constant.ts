export enum TEAM_CATEGORY_TYPE {
  // --- NHÓM QUẢN TRỊ (HEADQUARTER) ---
  ADMINISTRATION = 'ADMINISTRATION', // Hành chính, nhân sự tổng
  STRATEGIC_PLANNING = 'STRATEGIC', // Ban chiến lược
  CENTRAL_PURCHASING = 'PURCHASING', // Thu mua (làm việc với các hãng Samsung, Apple...)

  // --- NHÓM KINH DOANH & MARKETING ---
  SALES = 'SALES', // Bán hàng (đội cầm doanh số)
  MARKETING = 'MARKETING', // Chạy quảng cáo, chương trình khuyến mãi
  CUSTOMER_SERVICE = 'CS', // Chăm sóc khách hàng, tổng đài

  // --- NHÓM VẬN HÀNH & KHO (LOGISTICS) ---
  WAREHOUSE = 'WAREHOUSE', // Quản lý kho (tồn kho, nhập xuất)
  DELIVERY = 'DELIVERY', // Đội giao hàng
  TECHNICAL_FIX = 'TECHNICAL', // Đội kỹ thuật, lắp đặt, bảo hành

  // --- NHÓM TÀI CHÍNH ---
  ACCOUNTING = 'ACCOUNTING', // Kế toán, kiểm soát dòng tiền
}
