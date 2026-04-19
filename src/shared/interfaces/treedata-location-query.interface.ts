import { LocationRegionEntity } from '@/modules/location-regions/entities/location-region.entity';

// Định nghĩa kiểu dữ liệu trả về từ SQL (Entity gốc + các cột tính toán)
export type TreeDataLocationRegionQuery = Pick<LocationRegionEntity, 'id' | 'name' | 'type' | 'parent'> & {
  level: number;
  path_name: string;
};

// Định nghĩa kiểu cho Node trong cây (kèm mảng children)
export type LocationRegionNode = TreeDataLocationRegionQuery & {
  children: LocationRegionNode[];
};
