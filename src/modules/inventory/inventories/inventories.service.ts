import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { In, Not, Repository } from 'typeorm';
import { StoresService } from '../stores/stores.service';
import { ProductVariantsService } from '../../catalog/product-variants-SKU/product-variants.service';
import { Logger } from '@nestjs/common';
import { InventoryQueryDto } from './dto/query-inventory.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { InventoryStockType } from '@/shared/enums/inventory-stock-type.enum';
import { CheckoutInventoryDto } from './dto/check-inventory.dto';
import { CheckInventoryResult, StoreInventoryDetail } from './interface/check-inventory-result.interface';

@Injectable()
export class InventoriesService {
  private readonly logger = new Logger(InventoriesService.name);

  constructor(
    @InjectRepository(InventoryEntity)
    private inventoryRepo: Repository<InventoryEntity>,
    private storesService: StoresService,
    private productVariantsService: ProductVariantsService,

    private readonly cloudinaryService: CloudinaryService,
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

  async findAll(query: InventoryQueryDto): Promise<IMetadata<InventoryEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.inventoryRepo
      .createQueryBuilder('inventory')

      // Join các quan hệ
      .leftJoinAndSelect('inventory.store', 'store')
      .leftJoinAndSelect('inventory.productVariant', 'productVariant')
      .leftJoinAndSelect('productVariant.product', 'product')
      .leftJoinAndSelect('productVariant.productImages', 'productImages')

      // Select các trường cụ thể
      .select([
        'inventory.id',
        'inventory.quantity',
        'inventory.minStockLevel',
        'inventory.stockType',
        'inventory.createdAt',

        'store.id',
        'store.name',
        'store.address',

        'productVariant.id',
        'productVariant.sku',
        'productVariant.price',
        'productVariant.salesAttributes',

        'product.id',
        'product.name',

        'productImages.id',
        'productImages.image',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('inventory.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    const dataWithUrls = await this.signUrl(data);

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: InventoryQueryDto): Promise<IMetadata<InventoryEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.store', 'store')
      .leftJoinAndSelect('inventory.productVariant', 'productVariant')
      .select([
        'inventory.id',
        'store.id',
        'inventory.createdAt',
        'store.name',
        'store.address',
        'productVariant.id',
        'productVariant.sku',
      ])
      .skip(skip)
      .take(take)
      .orderBy('inventory.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async exists(ids: string[]) {
    const inventories = await this.inventoryRepo.find({ where: { id: In(ids) } });
    return inventories.length === ids.length;
  }

  async findOne(id: string) {
    return await this.inventoryRepo.findOne({ where: { id } });
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    // Chỉ lấy các trường cần thiết để update, loại bỏ store và productVariant nếu có trong DTO
    // để tránh việc thay đổi cặp định danh này
    const { store: storeId, productVariant: productVariantId, ...rest } = updateInventoryDto;

    try {
      // 1. Kiểm tra Inventory có tồn tại không
      const inventory = await this.inventoryRepo.findOne({
        where: { id },
        relations: ['store', 'productVariant'],
        select: {
          id: true,
          store: { id: true },
          productVariant: { id: true },
        },
      });
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
      return await this.inventoryRepo.save(updatedInventory);
    } catch (error) {
      this.logger.error('Error updating inventory:', (error as Error).message);
      throw error;
    }
  }

  async remove(id: string) {
    const inventory = await this.inventoryRepo.findOneBy({ id });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return this.inventoryRepo.remove(inventory);
  }

  async checkInventory(params: CheckoutInventoryDto): Promise<CheckInventoryResult> {
    const { quantityOrdered, variantId, storeIds } = params;

    const query = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.store', 'store')
      .where('inventory.productVariantId = :variantId', { variantId })
      .andWhere('inventory.stockType = :stockType', { stockType: InventoryStockType.AVAILABLE });

    if (storeIds?.length) {
      query.andWhere('store.id IN (:...storeIds)', { storeIds });
    }

    const inventories = await query.getMany();

    const details: StoreInventoryDetail[] = inventories.map((inv) => ({
      storeId: inv.store.id,
      storeName: inv.store.name,
      availableQuantity: inv.quantity,
      isSufficient: inv.quantity >= quantityOrdered,
      shortage: Math.max(0, quantityOrdered - inv.quantity),
    }));

    const totalAvailableQuantity = details.reduce((sum, d) => sum + d.availableQuantity, 0);
    const outOfStockStores = details.filter((d) => !d.isSufficient);

    // Nếu client chỉ định storeIds cụ thể -> yêu cầu TỪNG store đó phải đủ hàng riêng
    // (và phải tồn tại bản ghi inventory cho store đó, nếu thiếu record cũng coi là hết hàng)
    // Nếu không chỉ định (kiểm tra cả hệ thống) -> chỉ cần TỔNG tồn kho đủ là được
    const isAvailable = storeIds?.length
      ? details.length === storeIds.length && details.every((d) => d.isSufficient)
      : totalAvailableQuantity >= quantityOrdered;

    return {
      isAvailable,
      variantId,
      quantityOrdered,
      totalAvailableQuantity,
      details,
      outOfStockStores,
    };
  }

  async signUrl(data: InventoryEntity[]): Promise<InventoryEntity[]> {
    return await Promise.all(
      data.map(async (item) => {
        const images = item.productVariant?.productImages;

        if (images) {
          item.productVariant.productImages = await Promise.all(
            images.flat().map(async (img) => {
              if (img.image) {
                img.image = await this.cloudinaryService.generateImage(img.image);
              }

              return img;
            }),
          );
        }

        return item;
      }),
    );
  }
}
