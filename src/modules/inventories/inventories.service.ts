import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { In, Not, Repository } from 'typeorm';
import { StoresService } from '../stores/stores.service';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class InventoriesService {
  private readonly logger = new Logger(InventoriesService.name);

  constructor(
    @InjectRepository(InventoryEntity)
    private inventoryRepo: Repository<InventoryEntity>,
    private storesService: StoresService,
    private productVariantsService: ProductVariantsService,
  ) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const { store: storeId, productVariant: productVariantId, ...rest } = createInventoryDto;

    // Kiểm tra tồn tại của inventory với cặp store - productVariant
    const existingInventory = await this.inventoryRepo.findOne({
      where: { store: { id: storeId }, productVariant: { id: productVariantId } },
    });
    if (existingInventory)
      throw new ConflictException(
        `Inventory for store ${storeId} and product variant ${productVariantId} already exists`,
      );

    // Kiểm tra tồn tại của Store và ProductVariant trước khi tạo Inventory
    const [storeExists, productVariantExists] = await Promise.all([
      this.storesService.exists([storeId]),
      this.productVariantsService.exists([productVariantId]),
    ]);

    if (!storeExists) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    if (!productVariantExists) {
      throw new NotFoundException(`Product variant with ID ${productVariantId} not found`);
    }

    // Tạo inventory mới
    const inventory = this.inventoryRepo.create({
      ...rest,
      store: { id: storeId },
      productVariant: { id: productVariantId },
    });
    return await this.inventoryRepo.save(inventory);
  }

  async findAll() {
    return await this.inventoryRepo.find();
  }

  async exists(ids: string[]) {
    const inventories = await this.inventoryRepo.find({ where: { id: In(ids) } });
    return inventories.length === ids.length;
  }

  async findOne(id: string) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with id ${id} not found`);
    }
    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    // Chỉ lấy các trường cần thiết để update, loại bỏ store và productVariant nếu có trong DTO
    // để tránh việc thay đổi cặp định danh này
    const { store: storeId, productVariant: productVariantId, ...rest } = updateInventoryDto;

    // 1. Kiểm tra Inventory có tồn tại không
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    // 2. LOGIC PRODUCTION: Cảnh báo nếu User cố tình thay đổi Store hoặc Variant
    // Trong thực tế, cặp Store - Variant là Unique. Nếu thay đổi, có thể gây xung đột với Inventory khác.
    if (
      (storeId && storeId !== inventory.store.id) ||
      (productVariantId && productVariantId !== inventory.productVariant.id)
    ) {
      // Check xem cặp Store - Variant mới đã tồn tại ở bản ghi khác chưa
      const sId = storeId || inventory.store.id;
      const vId = productVariantId || inventory.productVariant.id;

      const duplicate = await this.inventoryRepo.exists({
        where: {
          store: { id: sId },
          productVariant: { id: vId },
          id: Not(id), // Không tính chính nó
        },
      });

      if (duplicate) {
        throw new ConflictException(`Inventory with store ${sId} and product variant ${vId} already exists`);
      }

      // Kiểm tra tồn tại của Store/Variant mới nếu có update
      if (storeId) {
        const storeExists = await this.storesService.exists([storeId]);
        if (!storeExists) throw new NotFoundException(`Store ${storeId} not exist`);
      }
      if (productVariantId) {
        const variantExists = await this.productVariantsService.exists([productVariantId]);
        if (!variantExists) throw new NotFoundException(`Variant ${productVariantId} not exist`);
      }
    }

    // 3. Sử dụng preload để gộp dữ liệu
    const updatedInventory = await this.inventoryRepo.preload({
      id,
      ...rest,
      // Chỉ map lại quan hệ nếu có sự thay đổi
      store: storeId ? { id: storeId } : undefined,
      productVariant: productVariantId ? { id: productVariantId } : undefined,
    });
    if (!updatedInventory) throw new NotFoundException(`Inventory with id ${id} not found for update`);

    // 4. Lưu lại
    try {
      return await this.inventoryRepo.save(updatedInventory);
    } catch (error) {
      this.logger.error('Error updating inventory:', (error as Error).message);
      throw new InternalServerErrorException('Lỗi hệ thống khi cập nhật kho hàng');
    }
  }

  async remove(id: string) {
    const inventory = await this.findOne(id);
    return this.inventoryRepo.remove(inventory);
  }
}
