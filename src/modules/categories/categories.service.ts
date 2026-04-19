import { CategoryNode, TreeDataCategoryQuery } from '@/shared/interfaces/treedata-category-query.interface';
import { stringToSlug } from '@/utils/string-to-slug.util';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, parent: parentId, ...rest } = createCategoryDto;
    const slug = stringToSlug(name);

    // Kiểm tra tên category đã tồn tại chưa
    const existingCategory = await this.categoryRepo.exists({ where: { slug } });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    // Nếu có parentId, kiểm tra xem category cha có tồn tại không
    if (parentId) {
      const parentCategory = await this.categoryRepo.findOne({ where: { id: parentId } });
      if (!parentCategory) {
        throw new ConflictException('Parent category not found');
      }
    }

    const category = this.categoryRepo.create({
      ...rest,
      slug,
      name,
      code: this.generateCategoryCode(name),
      parent: parentId ? { id: parentId } : null,
    });
    return this.categoryRepo.save(category);
  }

  async findAll() {
    return await this.categoryRepo.find({ relations: ['parent', 'children'] });
  }

  async getTreeData(rootId?: string) {
    // Nếu truyền rootId: lấy cây con của node đó
    // Nếu không truyền: lấy toàn bộ các cây từ các gốc (parent IS NULL)
    const whereClause = rootId ? `id = '${rootId}'` : `parent IS NULL`;

    const sqlQuery = `
      WITH RECURSIVE category_tree AS (
        -- 1. Điểm bắt đầu: Node gốc được chỉ định
        SELECT 
          id, name, "desc", slug, "imageUrl", code, "parent",
          0 AS level,
          name::text AS path_name
        FROM categories
        WHERE ${whereClause}
  
        UNION ALL
  
        -- 2. Đệ quy: Tìm các con của node hiện tại
        SELECT 
          c.id, c.name, c."desc", c.slug, c."imageUrl", c.code, c."parent",
          p.level + 1,
          (p.path_name || ' -> ' || c.name)
        FROM categories c
        INNER JOIN category_tree p ON c."parent" = p.id
      )
      SELECT * FROM category_tree ORDER BY level, id;
    `;

    const flatResults = await this.categoryRepo.query<TreeDataCategoryQuery[]>(sqlQuery);

    return this.buildTree(flatResults);
  }

  // Hàm phụ trợ để chuyển mảng phẳng thành cây (Performance O(n))
  private buildTree(dataset: TreeDataCategoryQuery[]): CategoryNode[] {
    // 1. Sửa Record: Key là string (hoặc number), Value là Node
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hashTable: Record<string, CategoryNode> = Object.create(null);
    const dataTree: CategoryNode[] = [];

    // Bước 1: Khởi tạo hashTable với các object có sẵn mảng children
    dataset.forEach((aData) => {
      hashTable[aData.id.toString()] = { ...aData, children: [] as CategoryNode[] };
    });

    // Bước 2: Xây dựng cây
    dataset.forEach((aData) => {
      const currentNode = hashTable[aData.id.toString()];
      const parentId = aData?.parent as string | null;

      if (parentId && hashTable[parentId.toString()]) {
        // Nếu có cha và cha tồn tại trong bảng băm
        hashTable[parentId].children.push(currentNode);
      } else if (!parentId) {
        // Nếu không có cha -> Đây là gốc (Root)
        dataTree.push(currentNode);
      }
      // Lưu ý: Nếu có parentId nhưng cha không nằm trong dataset (trường hợp lấy một nhánh lửng)
      // thì node đó sẽ "mồ côi" nếu bạn không xử lý.
      // Tùy nghiệp vụ bạn có thể đẩy nó vào dataTree luôn.
    });

    return dataTree;
  }

  async exists(ids: string[]) {
    const categories = await this.categoryRepo.find({ where: { id: In(ids) } });
    return categories.length === ids.length;
  }

  async findCodeById(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id }, select: ['code'] });
    return category?.code;
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, parent: parentId, ...rest } = updateCategoryDto;

    // 0. Kiểm tra nếu có name thì phải unique
    if (name) {
      const slug = stringToSlug(name);
      const existingCategory = await this.categoryRepo.exists({
        where: { slug, id: Not(id) },
      });
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    // 1. Chặn lỗi logic: Không được phép chọn chính mình làm cha (circular reference)
    if (parentId && parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    // 2. Kiểm tra Parent có tồn tại không (nếu có update parent)
    if (parentId) {
      const parentExists = await this.categoryRepo.exists({ where: { id: parentId } });
      if (!parentExists) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`);
      }
    }

    // 3. Gán thủ công để đảm bảo TypeORM hiểu đây là quan hệ Entity, không phải String
    const category = await this.categoryRepo.preload({
      id,
      name,
      slug: name ? stringToSlug(name) : undefined,
      code: name ? this.generateCategoryCode(name) : undefined,
      ...rest,
      parent: parentId ? { id: parentId } : undefined,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // 4. Lưu và trả về dữ liệu đã update
    try {
      return await this.categoryRepo.save(category);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new InternalServerErrorException('Error updating category', (error as Error).message);
    }
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return await this.categoryRepo.remove(category);
  }

  private generateCategoryCode(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 5) // Lấy 5 ký tự đầu tiên
      .toLocaleUpperCase(); // Loại bỏ dấu => chỉ còn chữ cái
  }
}
