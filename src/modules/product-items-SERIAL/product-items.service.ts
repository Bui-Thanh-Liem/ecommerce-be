import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { UpdateProductItemDto } from './dto/update-product-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductItemEntity } from './entities/product-item.entity';
import { Not, Repository } from 'typeorm';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';
import { InventoriesService } from '../inventories/inventories.service';

@Injectable()
export class ProductItemsService {
  constructor(
    @InjectRepository(ProductItemEntity)
    private productItemRepo: Repository<ProductItemEntity>,
    private productVariantsService: ProductVariantsService,
    private inventoriesService: InventoriesService,
  ) {}

  async create(createProductItemDto: CreateProductItemDto) {
    const { productVariant: productVariantId, inventory: inventoryId, serialNumber, ...rest } = createProductItemDto;

    // Kiểm tra trùng serial number
    const serialExists = await this.productItemRepo.findOne({ where: { serialNumber } });
    if (serialExists) {
      throw new ConflictException(`Product item with serial number ${serialNumber} already exists`);
    }

    // Kiểm tra tồn tại của ProductVariant và Inventory trước khi tạo ProductItem
    const [variantExists, inventoryExists] = await Promise.all([
      this.productVariantsService.exists([productVariantId]),
      this.inventoriesService.exists([inventoryId]),
    ]);

    if (!variantExists) {
      throw new NotFoundException(`Product variant with id ${productVariantId} not found`);
    }

    if (!inventoryExists) {
      throw new NotFoundException(`Inventory with id ${inventoryId} not found`);
    }

    // Tạo ProductItem mới
    const productItem = this.productItemRepo.create({
      ...rest,
      productVariant: { id: productVariantId },
      inventory: { id: inventoryId },
    });
    return this.productItemRepo.save(productItem);
  }

  async findAll() {
    return await this.productItemRepo.find();
  }

  async findOne(id: string) {
    const productItem = await this.productItemRepo.findOne({ where: { id } });
    if (!productItem) {
      throw new NotFoundException(`Product item with id ${id} not found`);
    }
    return productItem;
  }

  async update(id: string, updateProductItemDto: UpdateProductItemDto) {
    const { productVariant: productVariantId, inventory: inventoryId, serialNumber, ...rest } = updateProductItemDto;

    // 1. Kiểm tra ProductItem có tồn tại không trước khi làm bất cứ thứ gì
    const productItem = await this.productItemRepo.findOne({ where: { id } });
    if (!productItem) {
      throw new NotFoundException(`Product item với ID ${id} không tồn tại`);
    }

    // 2. Nếu có update SerialNumber, phải check xem có bị trùng với máy khác không
    if (serialNumber && serialNumber !== productItem.serialNumber) {
      const serialExists = await this.productItemRepo.exists({
        where: { serialNumber, id: Not(id) }, // Loại trừ chính nó ra
      });
      if (serialExists) {
        throw new ConflictException(`Số Serial ${serialNumber} đã tồn tại trên một thiết bị khác`);
      }
    }

    // 3. Kiểm tra tính hợp lệ của Foreign Keys (nếu có update)
    if (productVariantId || inventoryId) {
      const checks: Promise<boolean>[] = [];
      if (productVariantId) checks.push(this.productVariantsService.exists([productVariantId]));
      if (inventoryId) checks.push(this.inventoriesService.exists([inventoryId]));

      const results = await Promise.all(checks);

      // Nếu update cả 2 thì results có 2 phần tử, nếu 1 thì có 1 phần tử
      if (productVariantId && !results[0]) {
        throw new NotFoundException(`Product variant ${productVariantId} không tồn tại`);
      }
      // Logic check này cần khớp với thứ tự push vào mảng checks
      if (inventoryId && !results[productVariantId ? 1 : 0]) {
        throw new NotFoundException(`Kho hàng (Inventory) ${inventoryId} không tồn tại`);
      }
    }

    // 4. Sử dụng preload để gộp dữ liệu (Find & Merge)
    const updatedProductItem = await this.productItemRepo.preload({
      id,
      ...rest,
      serialNumber,
      productVariant: productVariantId ? { id: productVariantId } : undefined,
      inventory: inventoryId ? { id: inventoryId } : undefined,
    });
    if (!updatedProductItem) throw new NotFoundException(`Product item with id ${id} not found for update`);

    //
    return await this.productItemRepo.save(updatedProductItem);
  }

  async remove(id: string) {
    const productItem = await this.findOne(id);
    return this.productItemRepo.remove(productItem);
  }
}
