import { CategoryNode, TreeDataCategoryQuery } from '@/shared/interfaces/treedata-category-query.interface';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { CategoryQueryDto } from './dto/query-category.dto';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { StoresService } from '../../inventory/stores/stores.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
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
    } catch (error) {
      await this.removeImageForError(createCategoryDto.image?.key);
      this.logger.error(`Failed to create category`, error);
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
    const dataWithUrls = await Promise.all(
      data.map(async (category) => {
        if (category.image && category.image.key) {
          category.image.url = await this.cloudinaryService.generateUrl(category.image.key);
        }
        return category;
      }),
    );

    return {
      data: dataWithUrls,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: CategoryQueryDto): Promise<IMetadata<CategoryEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.categoryRepo
      .createQueryBuilder('category')
      .select(['category.id', 'category.name', 'category.slug'])
      .skip(skip)
      .take(take)
      .orderBy('category.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
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

    if (category?.image && category.image.key) {
      category.image.url = await this.cloudinaryService.generateUrl(category.image.key);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, parent: parentId, image, ...rest } = updateCategoryDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // [GUARD CLAUSE]: Chặn lỗi logic ngay lập tức, không được phép chọn chính mình làm cha
    if (parentId && parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    // Lấy dữ liệu cũ để check tồn tại và giữ lại thông tin ảnh cũ
    const oldCategory = await this.categoryRepo.findOne({
      where: { id },
      select: { id: true, name: true, slug: true, image: true },
    });
    if (!oldCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const slug = name ? stringToSlug(name) : undefined;

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const [isSlugDup, isParentValid] = await Promise.all([
      name ? this.categoryRepo.exists({ where: { slug, id: Not(id) } }) : Promise.resolve(false),
      parentId ? this.categoryRepo.exists({ where: { id: parentId } }) : Promise.resolve(true),
    ]);

    if (isSlugDup) {
      throw new ConflictException('Category with this name already exists');
    }
    if (!isParentValid) {
      throw new NotFoundException(`Parent category with ID ${parentId} not found`);
    }

    // Ghi nhận key ảnh cũ phục vụ việc xóa sau khi commit thành công
    const oldImageKey = oldCategory.image?.key;

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedCategory = this.categoryRepo.merge(oldCategory, {
        ...rest,
        ...(name && { name, slug, code: this.generateCategoryCode(name) }),
        ...(parentId && { parent: { id: parentId } }),
      });

      if (image !== undefined) {
        updatedCategory.image = image; // Hoặc kiểu dữ liệu Entity tương ứng của bạn
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(CategoryEntity, updatedCategory);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp ảnh MỚI vừa được truyền lên từ Dto để tránh rác Cloudinary
      if (image?.key) {
        await this.removeImageForError(image.key).catch((err) =>
          this.logger.error(`Failed to cleanup new category image on error`, err),
        );
      }

      this.logger.error(`Failed to update category with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    try {
      // Chỉ xóa ảnh cũ nếu có truyền ảnh mới lên, ảnh cũ có tồn tại và hai key khác nhau
      if (image !== undefined && oldImageKey && image.key !== oldImageKey) {
        await this.cloudinaryQueue.add(
          'delete-image',
          { publicId: oldImageKey },
          { jobId: `delete-${oldImageKey}-${Date.now()}` },
        );
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete old category image from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.categoryRepo.remove(category);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (category.image && category.image.key) {
      await this.cloudinaryQueue.add(
        'delete-image',
        { publicId: category.image.key },
        { jobId: `delete-${category.image.key}-${Date.now()}` },
      );
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

  private async removeImageForError(key?: string) {
    if (!key) return;
    return await this.cloudinaryQueue.add('delete-image', { publicId: key }, { jobId: `delete-${key}-${Date.now()}` });
  }
}
