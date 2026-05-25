import { CategoryNode, TreeDataCategoryQuery } from '@/shared/interfaces/treedata-category-query.interface';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { CategoryQueryDto } from './dto/query-category.dto';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/cloud-storage/cloudinary/cloudinary.service';
import { StoresService } from '../../inventory/stores/stores.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, parent: parentId, ...rest } = createCategoryDto;
    const slug = stringToSlug(name);

    try {
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
    } catch (error) {
      await this.removeImageForError(createCategoryDto.image?.key);
      this.logger.debug(`Failed to create category`, error);
      throw error;
    }
  }

  async findAll(query: CategoryQueryDto): Promise<IMetadata<CategoryEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.categoryRepo
      .createQueryBuilder('category')

      // Join các quan hệ
      .leftJoinAndSelect('category.parent', 'parent')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'category.id',
        'category.name',
        'category.slug',
        'category.desc',
        'category.image',
        'category.code',
        'category.createdAt',
        'parent.id',
        'parent.name',
      ]);

    // Phân trang và sắp xếp
    queryBuilder.skip(skip).take(take).orderBy('category.createdAt', 'DESC');

    //
    const [data, total] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    data.forEach((category) => {
      if (category.image && category.image.key) {
        category.image.url = this.cloudinaryService.generateUrl(category.image.key);
      }
    });

    return {
      data,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async getTreeData(query: CategoryQueryDto) {
    const { filters } = query;
    const parent = filters?.parent;

    // Nếu truyền rootId: lấy cây con của node đó
    // Nếu không truyền: lấy toàn bộ các cây từ các gốc (parent IS NULL)
    const whereClause = parent ? `parent = '${parent}'` : `parent IS NULL`;

    const sqlQuery = `
      WITH RECURSIVE category_tree AS (
        -- 1. Điểm bắt đầu: Node gốc được chỉ định
        SELECT 
          id, name, "desc", slug, "image", code, "parent",
          0 AS level,
          name::text AS path_name
        FROM categories
        WHERE ${whereClause}
  
        UNION ALL
  
        -- 2. Đệ quy: Tìm các con của node hiện tại
        SELECT 
          c.id, c.name, c."desc", c.slug, c."image", c.code, c."parent",
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
    const { name, parent: parentId, image, ...rest } = updateCategoryDto;

    try {
      // 1. Kiểm tra xem category có tồn tại không
      const oldCategory = await this.categoryRepo.findOneBy({ id });
      if (!oldCategory) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // 2. Kiểm tra nếu có name thì phải unique
      if (name) {
        const slug = stringToSlug(name);
        const existingCategory = await this.categoryRepo.exists({
          where: { slug, id: Not(id) },
        });
        if (existingCategory) {
          throw new ConflictException('Category with this name already exists');
        }
      }

      // Chặn lỗi logic: Không được phép chọn chính mình làm cha (circular reference)
      if (parentId && parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      // Kiểm tra Parent có tồn tại không (nếu có update parent)
      if (parentId) {
        const parentExists = await this.categoryRepo.exists({ where: { id: parentId } });
        if (!parentExists) {
          throw new NotFoundException(`Parent category with ID ${parentId} not found`);
        }
      }

      // Lưu lại key của ảnh cũ để nếu có cập nhật ảnh mới thì sẽ xóa ảnh cũ sau
      const oldImageKey = oldCategory.image?.key;

      // 3. Cập nhật category
      const category = this.categoryRepo.merge(oldCategory, {
        ...rest,
        name,
        image: image || oldCategory.image,
        slug: name ? stringToSlug(name) : undefined,
        parent: parentId ? { id: parentId } : undefined,
        code: name ? this.generateCategoryCode(name) : undefined,
      });
      await this.categoryRepo.save(category);

      // 4. Nếu có cập nhật ảnh, xóa ảnh cũ trên Cloudinary
      if (image?.key && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryService.deleteImage(oldImageKey);
      }
    } catch (error) {
      await this.removeImageForError(updateCategoryDto.image?.key);
      this.logger.debug(`Failed to update category with ID ${id}`, error);
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước - Chạy mất vài mili-giây, giải phóng DB ngay lập tức
    await this.categoryRepo.remove(category);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (category.image && category.image.key) {
      try {
        await this.cloudinaryService.deleteImage(category.image.key);
      } catch (error) {
        // Nếu lỗi cloud ở đây, DB đã xóa xong nên hệ thống KHÔNG bị lỗi hiển thị ảnh chết.
        // Chúng ta chỉ bị thừa 1 cái ảnh rác trên Cloudinary.
        // Log lỗi lại để dùng Cron Job quét rác sau,
        // hoặc ném vào Queue để nó tự động xóa lại (Retry).
        console.error(`Failed to delete image from Cloudinary: ${category.image.key}`, error);
      }
    }

    return true;
  }

  private generateCategoryCode(name: string): string {
    if (!name) throw new BadRequestException('Name is required !');
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd') // xử lý riêng đ
      .replace(/Đ/g, 'D')
      .substring(0, 10) // Lấy 10 ký tự đầu tiên
      .toLocaleUpperCase(); // Loại bỏ dấu => chỉ còn chữ cái
  }

  private removeImageForError(key?: string) {
    if (!key) return;
    return this.cloudinaryService.deleteImage(key);
  }
}
