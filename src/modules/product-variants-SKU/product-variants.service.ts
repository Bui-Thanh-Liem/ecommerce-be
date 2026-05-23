import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { In, Not, Repository } from 'typeorm';
import { ProductsService } from '../products-SPU/products.service';
import { ProductCodeService } from '../product-code/product-code.service';
import { ProductVariantQueryDto } from './dto/query-product-variant-SKU.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CloudinaryService } from '@/cloud-storage/cloudinary/cloudinary.service';
import { ProductImageEntity } from '../product-images/entities/product-image.entity';
import { IMetadata } from '@/shared/interfaces/metadata.interface';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private productVariantRepo: Repository<ProductVariantEntity>,
    private productsService: ProductsService,
    private productCodeService: ProductCodeService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    const { product: productId, productImages, ...rest } = createProductVariantDto;

    // 1. Kiểm tra tồn tại của Product trước khi tạo ProductVariant
    const spu = await this.productsService.findSPUById(productId);
    if (!spu) throw new NotFoundException(`Product with id ${productId} not found`);

    // 2.  Tạo SKU dựa trên SPU và specifications
    const sku = this.productCodeService.generateSKUCode(spu, rest.salesAttributes);

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

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'productVariant.id',
        'productVariant.sku',
        'productVariant.vat',
        'productVariant.price',
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

  async exists(ids: string[]) {
    const variants = await this.productVariantRepo.find({ where: { id: In(ids) } });
    return variants.length === ids.length;
  }

  async findOne(id: string) {
    return await this.productVariantRepo.findOne({ where: { id } });
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    const { product: productId, ...rest } = updateProductVariantDto;

    // Preload entity hiện tại + merge dữ liệu mới
    const existingVariant = await this.productVariantRepo.preload({
      id,
      ...rest,
      ...(productId && { product: { id: productId } }),
    });

    if (!existingVariant) {
      throw new NotFoundException(`Product variant with id ${id} not found`);
    }

    // Nếu có cập nhật Product (SPU), kiểm tra tồn tại
    let spu: string | undefined = existingVariant.product.spu;
    if (productId) {
      spu = await this.productsService.findSPUById(productId);
      if (!spu) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }
    }

    // Tạo SKU mới nếu salesAttributes hoặc product thay đổi
    let sku = existingVariant.sku;

    const shouldRegenerateSKU = productId || rest.salesAttributes !== undefined;

    if (shouldRegenerateSKU) {
      sku = this.productCodeService.generateSKUCode(spu, rest.salesAttributes ?? existingVariant.salesAttributes);

      // Kiểm tra SKU có bị trùng không (trừ variant hiện tại)
      const existsSKU = await this.productVariantRepo.findOne({
        where: {
          sku,
          id: Not(id),
        },
      });

      if (existsSKU) {
        throw new ConflictException(`Product variant with SKU ${sku} already exists`);
      }

      existingVariant.sku = sku;
    }

    return this.productVariantRepo.save(existingVariant);
  }

  async remove(id: string) {
    const productVariant = await this.findOne(id);
    if (productVariant) {
      await this.productVariantRepo.remove(productVariant);
    }
  }
}
