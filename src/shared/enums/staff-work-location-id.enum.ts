export enum StaffWorkLocationID {
  REMOTE = 'Remote', // staff làm việc từ xa, không thuộc chi nhánh nào
  STORE_BASED = 'StoreBased', // staff làm việc tại một chi nhánh cụ thể, chỉ thuộc một chi nhánh
  REGIONAL = 'Regional', // staff làm việc tại vùng, có nhiều chi nhánh (trực thuộc đội sửa chữa tại một vùng có nhiều store)
  HEADQUARTERS = 'Headquarters', // staff làm việc tại trụ sở chính, có thể quản lý nhiều chi nhánh
}
