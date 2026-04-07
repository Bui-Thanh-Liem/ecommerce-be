import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { In, Not, Repository } from 'typeorm';
import { ProductsService } from '../products-SPU/products.service';
import { ProductCodeService } from '../product-code/product-code.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private productVariantRepo: Repository<ProductVariantEntity>,
    private productsService: ProductsService,
    private productCodeService: ProductCodeService,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    const { product: productId, ...rest } = createProductVariantDto;

    // Kiểm tra tồn tại của Product trước khi tạo ProductVariant
    const spu = await this.productsService.findSPUById(productId);
    if (!spu) throw new NotFoundException(`Product with id ${productId} not found`);

    // Tạo SKU dựa trên SPU và specifications
    const sku = this.productCodeService.generateSKUCode(spu, rest.specifications);
    const exitsSKU = await this.productVariantRepo.findOne({ where: { sku } });
    if (exitsSKU) throw new NotFoundException(`Product variant with SKU ${sku} already exists`);

    //
    const productVariant = this.productVariantRepo.create({
      ...rest,
      sku,
      product: { id: productId },
    });
    return this.productVariantRepo.save(productVariant);
  }

  async findAll() {
    return this.productVariantRepo.find();
  }

  async exists(ids: string[]) {
    const variants = await this.productVariantRepo.find({ where: { id: In(ids) } });
    return variants.length === ids.length;
  }

  async findOne(id: string) {
    return this.productVariantRepo.findOne({ where: { id } });
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

    // Tạo SKU mới nếu specifications hoặc product thay đổi
    let sku = existingVariant.sku;

    const shouldRegenerateSKU = productId || rest.specifications !== undefined;

    if (shouldRegenerateSKU) {
      sku = this.productCodeService.generateSKUCode(spu, rest.specifications ?? existingVariant.specifications);

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
