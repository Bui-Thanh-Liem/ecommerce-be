export enum LocationRegionType {
  ROOT = 'root', // Cấp gốc, không có cha
  COUNTRY = 'country', // Quốc gia
  PROVINCE_CITY = 'province/city', // Tỉnh/Thành phố
  DISTRICT_TOWN = 'district/town', // Quận/Huyện/Thị xã
  WARD_COMMUNE = 'ward/commune', // Phường/Xã
}
