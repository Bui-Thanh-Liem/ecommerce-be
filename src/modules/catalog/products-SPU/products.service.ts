import { stringToSlug } from '@/utils/string-to-slug.util';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductCodeService } from '../product-code/product-code.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ProductQueryDto } from './dto/query-product.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { ProductImageEntity } from '../product-images/entities/product-image.entity';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
    private readonly cateService: CategoriesService,
    private readonly brandService: BrandsService,
    private readonly productCodeService: ProductCodeService,

    @Inject(forwardRef(() => ProductVariantsService))
    private readonly productVariantService: ProductVariantsService,

    private dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      category: categoryId,
      secondaryCategories: secondaryCategoryIds,
      brand: brandId,
      name,
      model,
      productImages,
      ...rest
    } = createProductDto;
    try {
      const slug = stringToSlug(name);

      // 1. Kiểm tra trùng (Unique constraint check)
      const [eS, eM, categoryCode, brandCode, thumb, secondaryCategoriesExist] = await Promise.all([
        this.productRepo.findOne({ where: { slug } }),
        this.productRepo.findOne({ where: { model } }),
        this.cateService.findCodeById(categoryId),
        this.brandService.findCodeById(brandId),
        productImages?.length > 0 ? this.cloudinaryService.generateUrl(productImages[0].image.key) : null,
        secondaryCategoryIds.length > 0 ? this.cateService.exists(secondaryCategoryIds) : null,
      ]);
      if (eS) throw new ConflictException('Product with this name already exists');
      if (eM) throw new ConflictException('Product with this model already exists');
      if (!categoryCode) throw new NotFoundException('Category code not found');
      if (!brandCode) throw new NotFoundException('Brand code not found');
      if (secondaryCategoryIds.length > 0 && !secondaryCategoriesExist)
        throw new NotFoundException('One or more secondary categories not found');

      // 2. Sinh mã SPU
      const spu = this.productCodeService.generateSPUCode(categoryCode, brandCode, model);
      const exitsSPU = await this.productRepo.findOne({ where: { spu } });
      if (exitsSPU) throw new ConflictException(`Product with SPU ${spu} already exists`);

      // 3. Tạo và lưu
      // 4. Lúc này các Subscriber/Hooks như assignProductToImages sẽ chạy
      // để gán các giá trị cần thiết để bảng ProductImage có thể lưu được (như product, sortOrder, isThumbnail,...)
      const product = this.productRepo.create({
        ...rest,
        spu,
        slug,
        name,
        model,
        productImages, // Thêm productImages vào đây để cascade lưu
        brand: { id: brandId },
        thumbnail: thumb ?? undefined, // Lấy thumbnail từ productImages nếu có
        category: { id: categoryId },
        secondaryCategories: secondaryCategoryIds.map((id) => ({ id })),
      });
      return await this.productRepo.save(product);
    } catch (error) {
      await this.removeImagesForError(productImages?.map((img) => img?.image?.key));
      this.logger.debug(`Failed to create product`, error);
      throw error;
    }
  }

  async findAll(query: ProductQueryDto): Promise<IMetadata<ProductEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')

      // Join các quan hệ
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.secondaryCategories', 'secondaryCategories')
      .leftJoinAndSelect('product.productImages', 'productImages')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'product.id',
        'product.spu',
        'product.model',
        'product.name',
        'product.slug',
        'product.desc',
        'product.weight',
        'product.length',
        'product.width',
        'product.thumbnail',
        'product.isFeatured',
        'product.allowReview',
        'product.height',
        'product.status',
        'product.createdAt',
        'product.basePrice',
        'product.specifications',
        'product.discountPercent',
        'brand.id',
        'brand.name',
        'brand.slug',
        'brand.code',
        'category.id',
        'category.name',
        'category.slug',
        'category.code',
        'secondaryCategories.id',
        'secondaryCategories.name',
        'secondaryCategories.slug',
        'secondaryCategories.code',
        'productImages.id',
        'productImages.image',
        'productImages.sortOrder',
        'productImages.isThumbnail',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('product.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: ProductQueryDto): Promise<IMetadata<ProductEntity>> {
    const { page, limit, filters } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.productRepo.createQueryBuilder('product');

    if (filters?.name) {
      queryBuilder.andWhere('unaccent(product.name) ILIKE unaccent(:name)', { name: `%${filters.name}%` });
    }

    queryBuilder
      .select(['product.id', 'product.name', 'product.slug', 'product.thumbnail'])
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]) {
    const count = await this.productRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findSPUNameAndSlugById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      select: ['spu', 'slug', 'name', 'specifications'],
    });
    return {
      spu: product?.spu,
      slug: product?.slug,
      name: product?.name,
      specifications: product?.specifications,
    };
  }

  async findOne(id: string) {
    return await this.productRepo.findOne({ where: { id }, relations: ['category', 'brand'] });
  }

  async findOneBySlug(slug: string) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')

      //
      .where('product.slug = :slug', { slug })

      //
      .leftJoinAndSelect('product.productVariants', 'variant')

      //
      .select([
        'product.id',
        'product.name',
        'product.desc',
        'product.specifications',

        'variant.id',
        'variant.slug',
        'variant.price',
        'variant.discountPercent',
        'variant.salesAttributes',
      ]);

    //

    return await queryBuilder.getOne();
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const {
      category: categoryId,
      secondaryCategories: secondaryCategoryIds,
      brand: brandId,
      name,
      model,
      productImages,
      ...rest
    } = updateProductDto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và lấy các code phục vụ việc sinh SPU, dọn dẹp ảnh
    const oldProduct = await this.productRepo.findOne({
      where: { id },
      relations: ['productImages', 'category', 'brand'],
      select: {
        id: true,
        spu: true,
        model: true,
        brand: { id: true, code: true },
        category: { id: true, code: true },
        productImages: { id: true, image: true },
        secondaryCategories: { id: true, code: true },
      },
    });
    if (!oldProduct) {
      throw new NotFoundException('Product not found');
    }

    const slug = name ? stringToSlug(name) : undefined;

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const hasSecondaryCategories = secondaryCategoryIds && secondaryCategoryIds.length > 0;
    const [eS, eM, cateCode, brandCode, secondaryCategoriesExist] = await Promise.all([
      name ? this.productRepo.exists({ where: { slug, id: Not(id) } }) : null,
      model ? this.productRepo.exists({ where: { model, id: Not(id) } }) : null,
      categoryId ? this.cateService.findCodeById(categoryId) : null,
      brandId ? this.brandService.findCodeById(brandId) : null,
      hasSecondaryCategories ? this.cateService.exists(secondaryCategoryIds) : null,
    ]);

    if (eS) throw new ConflictException('Product with this name already exists');
    if (eM) throw new ConflictException('Product with this model already exists');
    if (categoryId && !cateCode) throw new NotFoundException('Category code not found');
    if (brandId && !brandCode) throw new NotFoundException('Brand code not found');
    if (hasSecondaryCategories && !secondaryCategoriesExist)
      throw new NotFoundException('One or more secondary categories not found');

    // Kiểm tra và xử lý logic thay đổi SPU Code
    let newSpuCode: string | undefined = undefined;
    const isChangingSpuComponents =
      categoryId !== oldProduct.category?.id || brandId !== oldProduct.brand?.id || model !== oldProduct.model;

    if (isChangingSpuComponents) {
      // [GUARD CLAUSE]: Kiểm tra xem SPU này đã có dữ liệu phát sinh chưa
      const hasVariants = await this.productVariantService.checkVariantByProductId(id);
      if (hasVariants) {
        throw new BadRequestException(
          'Cannot change Brand/Category/Model because this product already has variants or transactions.',
        );
      }

      const finalCategoryCode = cateCode || oldProduct.category?.code;
      const finalBrandCode = brandCode || oldProduct.brand?.code;
      const finalModel = model || oldProduct.model;

      if (finalCategoryCode && finalBrandCode && finalModel) {
        newSpuCode = this.productCodeService.generateSPUCode(finalCategoryCode, finalBrandCode, finalModel);

        // Check trùng SPU code mới phát sinh
        const isSpuDup = await this.productRepo.exists({ where: { id: Not(id), spu: newSpuCode } });
        if (isSpuDup) throw new ConflictException(`Product with SPU ${newSpuCode} already exists`);
      }
    }

    // Ghi nhận danh sách key của các ảnh cũ nhằm mục đích xóa sau này
    const oldImageKeys = oldProduct.productImages?.flatMap((img) => img.image?.key)?.filter(Boolean) || [];

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedProduct = this.productRepo.merge(oldProduct, {
        ...rest,
        spu: newSpuCode,
        ...(name && { name, slug }),
        ...(model && { model }),
        ...(brandId && { brand: { id: brandId } }),
        ...(categoryId && { category: { id: categoryId } }),
        ...(secondaryCategoryIds !== undefined && { secondaryCategories: secondaryCategoryIds.map((id) => ({ id })) }),
      });

      if (productImages !== undefined) {
        updatedProduct.productImages = productImages as ProductImageEntity[];
        updatedProduct.thumbnail = await this.cloudinaryService.generateUrl(productImages[0].image.key);
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(ProductEntity, updatedProduct);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, gom toàn bộ key ảnh MỚI vừa được upload từ Dto để xóa dọn dẹp rác
      const newKeys = productImages?.map((img) => img?.image?.key).filter((k): k is string => !!k) || [];
      if (newKeys.length > 0) {
        await this.removeImagesForError(newKeys).catch((err) =>
          this.logger.error(`Failed to cleanup new product images on error`, err),
        );
      }

      this.logger.error(`Failed to update product with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    try {
      if (productImages !== undefined) {
        const newImageKeys = productImages.map((img) => img.image?.key).filter(Boolean);
        const imagesToDelete = oldImageKeys.filter((key) => !newImageKeys.includes(key));

        if (imagesToDelete.length > 0) {
          await this.cloudinaryService.deleteMultipleImages(imagesToDelete);
        }
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete some old product images from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['productImages'],
      select: { id: true, productImages: { image: true, id: true } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.productRepo.remove(product);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (product.productImages && product.productImages.length > 0) {
      const imageKeys = product.productImages.map((img) => img.image?.key).filter((key): key is string => !!key);
      await this.cloudinaryService.deleteMultipleImages(imageKeys);
    }

    return true;
  }

  private async removeImagesForError(keys?: string[]) {
    if (!keys || keys.length === 0) return;
    return await this.cloudinaryService.deleteMultipleImages(keys);
  }

  private async signUrl(products: ProductEntity[]): Promise<ProductEntity[]> {
    return await Promise.all(
      products.map(async (product) => {
        const flattenedImages = product?.productImages?.flat() || [];

        const updatedImages = flattenedImages.map(async (img) => {
          const publicId = img?.image?.key || '';
          const url = publicId ? await this.cloudinaryService.generateUrl(publicId) : '';

          return {
            ...img,
            image: {
              ...img.image,
              url,
            },
          } as ProductImageEntity;
        });

        product.productImages = await Promise.all(updatedImages);

        return product;
      }),
    );
  }
}
