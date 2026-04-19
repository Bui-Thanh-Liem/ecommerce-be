import { LocationRegionNode, TreeDataLocationRegionQuery } from '@/shared/interfaces/treedata-location-query.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateLocationRegionDto } from './dto/create-location-region.dto';
import { UpdateLocationRegionDto } from './dto/update-location-region.dto';
import { LocationRegionEntity } from './entities/location-region.entity';

@Injectable()
export class LocationRegionsService {
  logger = new Logger(LocationRegionsService.name);

  constructor(
    @InjectRepository(LocationRegionEntity)
    private locationRegionRepo: Repository<LocationRegionEntity>,
  ) {}

  async create(createLocationRegionDto: CreateLocationRegionDto) {
    //
    const { parent: parentId, name } = createLocationRegionDto;

    //
    const existingRegion = await this.locationRegionRepo.findOneBy({ name });
    if (existingRegion) {
      throw new ConflictException(`Location region with name "${name}" already exists`);
    }

    // Nếu có parentId, tìm kiếm parent region
    if (parentId) {
      const parent = await this.locationRegionRepo.exists({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent region with ID ${parentId} not found`);
      }
    }

    // Tạo mới region với parent nếu có
    const locationRegion = this.locationRegionRepo.create({
      ...createLocationRegionDto,
      parent: parentId ? { id: parentId } : null,
      children: [],
    });
    return await this.locationRegionRepo.save(locationRegion);
  }

  async findAll() {
    return await this.locationRegionRepo.find({ relations: ['parent', 'children'] });
  }

  async exists(id: string): Promise<boolean> {
    return await this.locationRegionRepo.exists({ where: { id } });
  }

  async findOne(id: string) {
    const locationRegion = await this.locationRegionRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!locationRegion) {
      throw new NotFoundException(`Location region with ID ${id} not found`);
    }
    return locationRegion;
  }

  async update(id: string, updateLocationRegionDto: UpdateLocationRegionDto) {
    const { name, parent: parentId, ...rest } = updateLocationRegionDto;

    // 0. Kiểm tra nếu có name thì phải unique
    if (name) {
      const existingCategory = await this.locationRegionRepo.exists({
        where: { name, id: Not(id) },
      });
      if (existingCategory) {
        throw new ConflictException('Another location region with this name already exists');
      }
    }

    // 1. Chặn lỗi logic: Không được phép chọn chính mình làm cha (circular reference)
    if (parentId && parentId === id) {
      throw new BadRequestException('A location region cannot be its own parent');
    }

    // 2. Kiểm tra Parent có tồn tại không (nếu có update parent)
    if (parentId) {
      const parentExists = await this.locationRegionRepo.exists({ where: { id: parentId } });
      if (!parentExists) {
        throw new NotFoundException(`Parent region with ID ${parentId} not found`);
      }
    }

    // 3. Gán thủ công để đảm bảo TypeORM hiểu đây là quan hệ Entity, không phải String
    const locationRegion = await this.locationRegionRepo.preload({
      id,
      name,
      ...rest,
      parent: parentId ? { id: parentId } : undefined,
    });

    if (!locationRegion) {
      throw new NotFoundException(`Location region with ID ${id} not found`);
    }

    // 4. Lưu và trả về dữ liệu đã update
    try {
      return await this.locationRegionRepo.save(locationRegion);
    } catch (error) {
      // Xử lý lỗi khác nếu cần
      throw new InternalServerErrorException('Error updating location region', (error as Error).message);
    }
  }

  async getTreeData(rootId?: string) {
    // Nếu truyền rootId: lấy cây con của node đó
    // Nếu không truyền: lấy toàn bộ các cây từ các gốc (parent IS NULL)
    const whereClause = rootId ? `id = '${rootId}'` : `parent IS NULL`;

    const sqlQuery = `
    WITH RECURSIVE region_tree AS (
      -- 1. Điểm bắt đầu: Node gốc được chỉ định
      SELECT 
        id, name, type, parent,
        0 AS level,
        name::text AS path_name
      FROM location_regions
      WHERE ${whereClause}

      UNION ALL

      -- 2. Đệ quy: Tìm các con của node hiện tại
      SELECT 
        c.id, c.name, c.type, c.parent,
        p.level + 1,
        (p.path_name || ' -> ' || c.name)
      FROM location_regions c
      INNER JOIN region_tree p ON c.parent = p.id
    )
    SELECT * FROM region_tree ORDER BY level, id;
  `;

    const flatResults = await this.locationRegionRepo.query<TreeDataLocationRegionQuery[]>(sqlQuery);

    return this.buildTree(flatResults);
  }

  // Hàm phụ trợ để chuyển mảng phẳng thành cây (Performance O(n))
  private buildTree(dataset: TreeDataLocationRegionQuery[]): LocationRegionNode[] {
    // 1. Sửa Record: Key là string (hoặc number), Value là Node
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hashTable: Record<string, LocationRegionNode> = Object.create(null);
    const dataTree: LocationRegionNode[] = [];

    // Bước 1: Khởi tạo hashTable với các object có sẵn mảng children
    dataset.forEach((aData) => {
      hashTable[aData.id.toString()] = { ...aData, children: [] as LocationRegionNode[] };
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

  async remove(id: string) {
    const locationRegion = await this.locationRegionRepo.findOne({ where: { id } });
    if (!locationRegion) {
      throw new NotFoundException(`Location region with ID ${id} not found`);
    }
    return await this.locationRegionRepo.remove(locationRegion);
  }
}
