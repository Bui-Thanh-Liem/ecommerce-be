import { CategoryEntity } from '@/modules/categories/entities/category.entity';

// Định nghĩa kiểu dữ liệu trả về từ SQL (Entity gốc + các cột tính toán)
export type TreeDataCategoryQuery = Pick<CategoryEntity, 'id' | 'name' | 'code' | 'imageUrl' | 'parent'> & {
  level: number;
  path_name: string;
};

// Định nghĩa kiểu cho Node trong cây (kèm mảng children)
export type CategoryNode = TreeDataCategoryQuery & {
  children: CategoryNode[];
};
