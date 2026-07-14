import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { ProductCodeService } from '../product-code/product-code.service';
import { ProductImageEntity } from '../product-images/entities/product-image.entity';
import { ProductsService } from '../products-SPU/products.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { ProductVariantQueryDto } from './dto/query-product-variant-SKU.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { IVariantAttribute } from '@/shared/interfaces/models/catalog/product-variant.interface';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { CategoryEntity } from '../categories/entities/category.entity';
import { SORT_OPTIONS } from '@/shared/constants/sort-option.constant';
import { ProductVariantRagStatus } from '@/shared/enums/product-variant-rag-status.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { type DocumentType } from '@/modules/chatbot/document/document.type';
import { IngestVariantDto } from '@/modules/chatbot/rag/dto/ingest-variant.dto';

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(ProductVariantsService.name);

  constructor(
    @InjectRepository(ProductVariantEntity)
    private productVariantRepo: Repository<ProductVariantEntity>,

    @InjectQueue('rag')
    private readonly ragQueue: Queue,

    private productsService: ProductsService,
    private productCodeService: ProductCodeService,
    private dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    try {
      const { product: productId, productImages, ...rest } = createProductVariantDto;

      // 1. Kiểm tra tồn tại của Product trước khi tạo ProductVariant và lấy các thông tin cần thiết
      const { spu, slug, name, brand, category } = await this.productsService.findProductContextById(productId);
      if (!spu) throw new NotFoundException('Product not found');

      // 2. Tạo slug cho ProductVariant dựa trên SPU và salesAttributes
      const variantSlug = this.generateVariantSlug(rest.salesAttributes ?? [], slug);

      // 3.  Tạo SKU dựa trên SPU và specifications
      const salesAttributeSKU = rest.salesAttributes.filter((attr) => attr.isSKU);
      const sku = this.productCodeService.generateSKUCode(spu, salesAttributeSKU);

      // 4. Kiểm tra SKU có bị trùng không
      const exitsSKU = await this.productVariantRepo.findOne({ where: { sku } });
      if (exitsSKU) throw new NotFoundException('Product variant already exists');

      // 5. Tạo ProductVariant mới
      const productVariant = this.productVariantRepo.create({
        ...rest,
        sku,
        slug: variantSlug,
        product: { id: productId },
        productImages: productImages, // Thêm productImages vào đây để cascade lưu
      });
      const savedProductVariant = await this.productVariantRepo.save(productVariant);

      // 6. Đẩy job vào queue để nạp RAG
      await this.ragQueue.add('ingest-variant', {
        variant: {
          id: savedProductVariant.id,
          sku: savedProductVariant.sku,
          price: savedProductVariant.price,
          salesAttributes: savedProductVariant.salesAttributes,
          product: {
            id: productId,
            name,
            category,
            brand,
          },
        } as IngestVariantDto,
        type: 'public' as DocumentType,
      });

      return savedProductVariant;
    } catch (error) {
      await this.removeImagesForError(createProductVariantDto.productImages?.map((img) => img.image.url));
      this.logger.debug(`Failed to create brand`, error);
      throw error;
    }
  }

  async findAll(query: ProductVariantQueryDto): Promise<IMetadata<ProductVariantEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.productVariantRepo
      .createQueryBuilder('productVariant')

      // Join các quan hệ
      .leftJoinAndSelect('productVariant.product', 'product')
      .leftJoinAndSelect('productVariant.productImages', 'productImages')

      // Select các trường cụ thể
      .select([
        'productVariant.id',
        'productVariant.sku',
        'productVariant.vat',
        'productVariant.barcode',
        'productVariant.price',
        'productVariant.costPrice',
        'productVariant.createdAt',
        'productVariant.status',
        'productVariant.conditions',
        'productVariant.salesAttributes',
        'productVariant.discountPercent',
        'product.id',
        'product.name',
        'product.slug',
        'product.spu',
        'productImages.id',
        'productImages.image',
        'productImages.sortOrder',
        'productImages.isThumbnail',
      ])

      // Phân trang và sắp xếp
      .orderBy('productVariant.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: ProductVariantQueryDto): Promise<IMetadata<ProductVariantEntity>> {
    const { page, limit, filters } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.productVariantRepo
      .createQueryBuilder('pv')
      .leftJoinAndSelect('pv.product', 'product')
      .leftJoinAndSelect('pv.productImages', 'productImages');

    //
    if (filters?.name) {
      queryBuilder.andWhere('unaccent(product.name) ILIKE unaccent(:name)', { name: `%${filters.name}%` });
    }

    queryBuilder
      .select([
        'pv.id',
        'pv.sku',
        'pv.createdAt',
        'product.id',
        'product.name',
        'productImages.id',
        'productImages.image',
      ])

      .orderBy('pv.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findAllByCampaign(campaignId: string, query: ProductVariantQueryDto): Promise<IMetadata<ProductVariantEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.productVariantRepo
      .createQueryBuilder('pv')
      .leftJoinAndSelect('pv.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .leftJoinAndSelect('pv.campaigns', 'campaigns')
      .leftJoinAndSelect('pv.productImages', 'productImages')

      //
      .where('campaigns.id = :campaignId', { campaignId })

      //
      .select([
        'pv.id',
        'pv.sku',
        'pv.slug',
        'pv.price',
        'pv.createdAt',
        'pv.soldCount',
        'pv.conditions',
        'pv.status',
        'pv.salesAttributes',
        'pv.discountPercent',

        //
        'product.id',
        'product.name',
        'product.slug',
        'product.basePrice',
        'product.thumbnail',

        'category.id',
        'category.name',
        'category.slug',

        'parentCategory.id',
        'parentCategory.name',
        'parentCategory.slug',

        //
        'productImages.id',
        'productImages.image',
      ])

      //
      .orderBy('pv.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  /**
   *
   * @param id
   * @returns
   * @description cùng category, brand, >= 2 saleAttributes, price +-15%
   */
  async findVariantForSuggestById(id: string): Promise<string[]> {
    const variant = await this.productVariantRepo.findOne({
      where: { id },
      relations: {
        product: {
          brand: true,
          category: true,
        },
      },
      select: {
        id: true,
        price: true,
        salesAttributes: true,
        product: {
          id: true,
          brand: { id: true },
          category: { id: true },
        },
      },
    });
    if (!variant) return [];

    const { product, price, salesAttributes } = variant;
    const { category, brand } = product;

    // Lấy các key của salesAttributes
    const salesAttributeKeys = salesAttributes.map((attr) => attr.key);

    // Tìm các biến thể sản phẩm khác cùng category, brand, có ít nhất 2 salesAttributes trùng và giá trong khoảng +-15%
    const similarVariants = await this.productVariantRepo
      .createQueryBuilder('pv')
      .leftJoinAndSelect('pv.product', 'product')
      .where('product.categoryId = :categoryId', { categoryId: category.id })
      .andWhere('product.brandId = :brandId', { brandId: brand.id })
      .andWhere('pv.id != :variantId', { variantId: id })
      .andWhere('pv.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: price * 0.85,
        maxPrice: price * 1.15,
      })
      .select(['pv.id', 'pv.salesAttributes'])
      .take(3)
      .getMany();

    // Lọc các biến thể sản phẩm có ít nhất 2 salesAttributes trùng
    const filteredVariants = similarVariants
      .filter((v) => {
        const matchingAttributes = v.salesAttributes.filter((attr) => salesAttributeKeys.includes(attr.key));
        return matchingAttributes.length >= 2;
      })
      .map((v) => v.id);

    if (filteredVariants.length === 0) return [];

    return filteredVariants;
  }

  async findAllByCategorySlug(
    categorySlug: string,
    query: ProductVariantQueryDto,
  ): Promise<IMetadata<ProductVariantEntity>> {
    const { page, limit, filters } = query;
    const { s, b, fa } = filters || {};
    const attr = (fa ? JSON.parse(fa) : {}) as Record<string, string>;
    const { take, skip } = calculatePagination(page, limit);
    const categoryToUse = attr?.c || categorySlug;
    const brandToUse = attr?.b || b;

    // 1. Định nghĩa bảng ánh xạ giữa "Key Sort" và "Quy tắc Order"
    const SORT_CONFIG: Record<(typeof SORT_OPTIONS)[number], Record<string, 'ASC' | 'DESC'>> = {
      price_desc: { final_price: 'DESC' },
      price_asc: { final_price: 'ASC' },
      newest: { 'pv.createdAt': 'DESC' },
      best_seller: { 'pv.soldCount': 'DESC' },
      discount: { 'pv.discountPercent': 'DESC' },
      standout: { 'pv.discountPercent': 'DESC', 'pv.soldCount': 'DESC' },
      // Sau này có isFeatured chỉ cần sửa dòng trên thành:
      // standout: { 'pv.isFeatured': 'DESC', 'pv.viewCount': 'DESC' }
    };

    const currentSort = (s as (typeof SORT_OPTIONS)[number]) || 'newest'; // Mặc định là "newest" nếu không có sort hoặc sort không hợp lệ

    // 2. Áp dụng vào QueryBuilder một cách ngắn gọn
    const sortRules = SORT_CONFIG[currentSort] || { 'pv.createdAt': 'DESC' };

    const queryBuilder = this.productVariantRepo
      .createQueryBuilder('pv')
      .leftJoinAndSelect('pv.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.secondaryCategories', 'sCategory')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .leftJoinAndSelect('pv.campaigns', 'campaigns')
      .leftJoinAndSelect('pv.productImages', 'productImages')

      // Dùng Subquery
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('c.id')
          .from(CategoryEntity, 'c') // Entity Category
          .leftJoin('c.parent', 'p') // Nếu cần tìm cả category con của slug này
          .where('c.slug = :categorySlug OR p.slug = :categorySlug OR sCategory.slug = :categorySlug', {
            categorySlug: categoryToUse,
          })
          .getQuery();

        return 'category.id IN ' + subQuery;
      });

    //
    if (brandToUse) {
      queryBuilder.andWhere('brand.slug = :brandSlug', { brandSlug: brandToUse });
    }

    //
    Object.entries(attr).forEach(([key, value], index) => {
      if (['b', 'c', 's'].includes(key)) return;

      queryBuilder.andWhere(`pv.sales_attributes_index @> :filter${index}`, {
        [`filter${index}`]: JSON.stringify({
          [key]: value,
        }),
      });
    });

    queryBuilder.select([
      'pv.id',
      'pv.sku',
      'pv.slug',
      'pv.price',
      'pv.createdAt',
      'pv.soldCount',
      'pv.status',
      'pv.conditions',
      'pv.salesAttributes',
      'pv.discountPercent',

      'product.id',
      'product.name',
      'product.slug',
      'product.basePrice',
      'product.thumbnail',
      'product.specifications',

      'category.id',
      'category.name',
      'category.slug',

      'parentCategory.id',
      'parentCategory.name',
      'parentCategory.slug',
    ]);

    // 1. Thêm select và đặt tên viết THƯỜNG HOÀN TOÀN (để tránh lỗi tự động convert của Postgres)
    queryBuilder.addSelect('pv.price * (1 - COALESCE(pv.discountPercent, 0) / 100)', 'final_price');

    // Chạy vòng lặp để addOrderBy (hỗ trợ cả các trường hợp có nhiều tiêu chí như standout)
    Object.entries(sortRules).forEach(([column, direction]) => {
      queryBuilder.addOrderBy(column, direction);
    });

    queryBuilder.skip(skip).take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async countProductsByCategorySlug(categorySlug: string, query: ProductVariantQueryDto): Promise<{ count: number }> {
    const { filters } = query;
    const { fa } = filters || {};

    const attr = (fa ? JSON.parse(fa) : {}) as Record<string, string>;

    const categoryToUse = attr?.c || categorySlug;
    const brandToUse = attr?.b || undefined;

    const queryBuilder = this.productVariantRepo
      .createQueryBuilder('pv')
      .innerJoin('pv.product', 'product')
      .innerJoin('product.category', 'category')
      .leftJoin('product.secondaryCategories', 'sCategory')
      .leftJoin('category.parent', 'parentCategory')

      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('c.id')
          .from(CategoryEntity, 'c')
          .leftJoin('c.parent', 'p')
          .where('c.slug = :categorySlug OR p.slug = :categorySlug OR sCategory.slug = :categorySlug', {
            categorySlug: categoryToUse,
          })
          .getQuery();

        return 'category.id IN ' + subQuery;
      });

    // Brand
    if (brandToUse) {
      queryBuilder.leftJoin('product.brand', 'brand').andWhere('brand.slug = :brandSlug', {
        brandSlug: brandToUse,
      });
    }

    // Sales Attributes
    Object.entries(attr).forEach(([key, value], index) => {
      if (['b', 'c', 's'].includes(key)) return;

      queryBuilder.andWhere(`pv.sales_attributes_index @> :filter${index}`, {
        [`filter${index}`]: JSON.stringify({
          [key]: value,
        }),
      });
    });

    const count = await queryBuilder.getCount();

    return { count };
  }

  async exists(ids: string[]) {
    const variants = await this.productVariantRepo.find({ where: { id: In(ids) } });
    return variants.length === ids.length;
  }

  async findOne(id: string) {
    return await this.productVariantRepo.findOne({ where: { id } });
  }

  /**
   *
   * @param slug String
   * @returns ProductVariantEntity
   * @description Se duoc goi chung voi findOneBySlug cua product nen khong can join product tai day
   */
  async findOneBySlug(slug: string) {
    return await this.productVariantRepo.findOne({ where: { slug }, relations: ['productImages'] });
  }

  async update(id: string, dto: UpdateProductVariantDto) {
    const { product: productId, salesAttributes, productImages, ...rest } = dto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Lấy dữ liệu cũ để check tồn tại và chuẩn bị thông tin ảnh cũ, thuộc tính cũ
    const oldVariant = await this.productVariantRepo.findOne({
      where: { id },
      relations: ['productImages', 'product'],
      select: {
        id: true,
        sku: true,
        salesAttributes: true,
        product: { id: true, spu: true },
        productImages: { id: true, image: true },
      },
    });
    if (!oldVariant) {
      throw new NotFoundException('Product variant not found');
    }

    // Xác định SPU code phục vụ sinh SKU
    let finalSpu: string | undefined = oldVariant.product?.spu;
    const isChangingProduct = productId && productId !== oldVariant.product?.id;

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const [product] = await Promise.all([productId ? this.productsService.findProductContextById(productId) : null]);

    //
    const variantSlug = this.generateVariantSlug(salesAttributes ?? oldVariant.salesAttributes, product?.slug);

    //
    if (isChangingProduct && !product?.spu) {
      throw new NotFoundException('Product not found');
    }

    //
    if (isChangingProduct && product?.spu) {
      finalSpu = product.spu;
    }

    // Logic tạo và check trùng SKU code mới nếu các thành phần cấu thành thay đổi
    let newSkuCode: string | undefined = undefined;
    const isChangingSkuComponents = productId || salesAttributes !== undefined;

    if (isChangingSkuComponents) {
      const finalSalesAttributes = salesAttributes !== undefined ? salesAttributes : oldVariant.salesAttributes;
      const skuFilteredAttributes = finalSalesAttributes?.filter((attr) => attr.isSKU) || [];

      if (finalSpu) {
        newSkuCode = this.productCodeService.generateSKUCode(finalSpu, skuFilteredAttributes);

        // Kiểm tra SKU mới có bị trùng với variant khác không ngoài transaction
        const isSkuDup = await this.productVariantRepo.exists({
          where: { id: Not(id), sku: newSkuCode },
        });
        if (isSkuDup) {
          throw new ConflictException('Product variant already exists');
        }
      }
    }

    // Ghi nhận danh sách key của các ảnh cũ nhằm mục đích xóa sau này khi commit xong
    const oldImageKeys = oldVariant.productImages?.flatMap((img) => img.image?.key)?.filter(Boolean) || [];

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedVariant = this.productVariantRepo.merge(oldVariant, {
        ...rest,
        sku: newSkuCode,
        slug: variantSlug || undefined,
        salesAttributes: salesAttributes !== undefined ? salesAttributes : undefined,
        product: productId ? { id: productId } : undefined,
      });

      if (productImages !== undefined) {
        updatedVariant.productImages = productImages as ProductImageEntity[];
      }

      // Lưu vào DB qua transaction manager
      const updated = await queryRunner.manager.save(ProductVariantEntity, updatedVariant);

      // 6. Đẩy job vào queue để nạp RAG
      await this.ragQueue.add('ingest-variant', {
        variant: {
          id: updated.id,
          sku: updated.sku,
          price: updated.price,
          salesAttributes: updated.salesAttributes,
          product: product,
        } as IngestVariantDto,
        type: 'public' as DocumentType,
      });

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, gom toàn bộ key ảnh MỚI vừa được upload từ Dto để dọn dẹp rác trên Cloudinary
      const newKeys = productImages?.map((img) => img?.image?.key).filter((k): k is string => !!k) || [];
      if (newKeys.length > 0) {
        await this.removeImagesForError(newKeys).catch((err) =>
          this.logger.error(`Failed to cleanup new variant images on error`, err),
        );
      }

      this.logger.error(`Failed to update product variant with ID ${id}`, error);
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
      this.logger.warn(`Database updated but failed to delete some old variant images from Cloudinary`, cloudError);
    }
  }

  async changeRagStatus(id: string, newStatus: ProductVariantRagStatus) {
    const variant = await this.productVariantRepo.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    variant.ragStatus = newStatus;
    return await this.productVariantRepo.save(variant);
  }

  async remove(id: string) {
    const productVariant = await this.findOne(id);
    if (!productVariant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.productVariantRepo.remove(productVariant);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (productVariant.productImages && productVariant.productImages.length > 0) {
      const imageKeys = productVariant.productImages.map((img) => img.image?.key).filter((key): key is string => !!key);
      await this.cloudinaryService.deleteMultipleImages(imageKeys);
    }

    return true;
  }

  async checkVariantByProductId(productId: string) {
    return await this.productVariantRepo.exists({
      where: {
        product: { id: productId },
      },
    });
  }

  private async removeImagesForError(keys?: string[]) {
    if (!keys || keys.length === 0) return;
    return await this.cloudinaryService.deleteMultipleImages(keys);
  }

  private async signUrl(data: ProductVariantEntity[]): Promise<ProductVariantEntity[]> {
    return await Promise.all(
      data.map(async (variant) => {
        const flattenedImages = variant?.productImages?.flat() || [];
        const updatedImages = flattenedImages.map(async (img) => {
          const imgData = img?.image ? await this.cloudinaryService.generateImage(img?.image) : img?.image;

          return {
            ...img,
            image: {
              ...imgData,
            },
          } as ProductImageEntity;
        });
        variant.productImages = await Promise.all(updatedImages);

        //
        const imgThumbnail = variant.product.thumbnail;
        if (imgThumbnail?.key) {
          variant.product.thumbnail = await this.cloudinaryService.generateImage(imgThumbnail, {
            height: 400,
            width: 600,
          });
        }

        return variant;
      }),
    );
  }

  private generateVariantSlug(salesAttributes: IVariantAttribute[], productSlug?: string): string {
    if (!productSlug) return '';
    const slugParts = salesAttributes.filter((attr) => attr.isSKU).map((attr) => stringToSlug(attr.value));

    return `${productSlug}-${slugParts.join('-')}`;
  }
}
