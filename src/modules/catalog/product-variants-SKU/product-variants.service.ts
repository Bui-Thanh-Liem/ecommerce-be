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

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(ProductVariantsService.name);

  constructor(
    @InjectRepository(ProductVariantEntity)
    private productVariantRepo: Repository<ProductVariantEntity>,
    private productsService: ProductsService,
    private productCodeService: ProductCodeService,
    private dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    try {
      const { product: productId, productImages, ...rest } = createProductVariantDto;

      // 1. Kiểm tra tồn tại của Product trước khi tạo ProductVariant
      const spu = await this.productsService.findSPUById(productId);
      if (!spu) throw new NotFoundException(`Product with id ${productId} not found`);

      // 2.  Tạo SKU dựa trên SPU và specifications
      const salesAttributeSKU = rest.salesAttributes.filter((attr) => attr.isSKU);
      const sku = this.productCodeService.generateSKUCode(spu, salesAttributeSKU);

      // 3. Kiểm tra SKU có bị trùng không
      const exitsSKU = await this.productVariantRepo.findOne({ where: { sku } });
      if (exitsSKU) throw new NotFoundException(`Product variant with SKU ${sku} already exists`);

      // 4. Tạo ProductVariant mới
      const productVariant = this.productVariantRepo.create({
        ...rest,
        sku,
        product: { id: productId },
        productImages: productImages, // Thêm productImages vào đây để cascade lưu
      });
      return this.productVariantRepo.save(productVariant);
    } catch (error) {
      await this.removeImagesForError(createProductVariantDto.productImages?.map((img) => img.image.url));
      this.logger.debug(`Failed to create brand`, error);
      throw error;
    }
  }

  async findAll(query: ProductVariantQueryDto): Promise<IMetadata<ProductVariantEntity>> {
    const { page, limit } = query;

    //
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
      .skip(skip)
      .take(take)
      .orderBy('productVariant.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    const dataWithUrls = data.map((product) => {
      const flattenedImages = product?.productImages?.flat() || [];

      const updatedImages = flattenedImages.map((img) => {
        const publicId = img?.image?.key || '';
        const url = publicId ? this.cloudinaryService.generateUrl(publicId) : '';

        return {
          ...img,
          image: {
            ...img.image,
            url,
          },
        } as ProductImageEntity;
      });

      product.productImages = updatedImages;

      return product;
    });

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: ProductVariantQueryDto): Promise<IMetadata<ProductVariantEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.productVariantRepo
      .createQueryBuilder('pv')
      .leftJoinAndSelect('pv.product', 'product')
      .select(['pv.id', 'pv.sku', 'pv.createdAt', 'product.id', 'product.name'])
      .skip(skip)
      .take(take)
      .orderBy('pv.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]) {
    const variants = await this.productVariantRepo.find({ where: { id: In(ids) } });
    return variants.length === ids.length;
  }

  async findOne(id: string) {
    return await this.productVariantRepo.findOne({ where: { id } });
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    const { product: productId, salesAttributes, productImages, ...rest } = updateProductVariantDto;

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
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    // Xác định SPU code phục vụ sinh SKU
    let finalSpu: string | undefined = oldVariant.product?.spu;
    const isChangingProduct = productId && productId !== oldVariant.product?.id;

    // Chạy song song các câu lệnh check độc lập ngoài transaction
    const [fetchedSpu] = await Promise.all([
      isChangingProduct ? this.productsService.findSPUById(productId) : Promise.resolve(finalSpu),
    ]);

    if (isChangingProduct && !fetchedSpu) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (isChangingProduct) {
      finalSpu = fetchedSpu;
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
          throw new ConflictException(`Product variant with SKU ${newSkuCode} already exists`);
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
        salesAttributes: salesAttributes !== undefined ? salesAttributes : undefined,
        product: productId ? { id: productId } : undefined,
      });

      if (productImages !== undefined) {
        updatedVariant.productImages = productImages as ProductImageEntity[];
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(ProductVariantEntity, updatedVariant);

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
}
