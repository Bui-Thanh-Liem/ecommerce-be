import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarketingProgramDto } from './dto/create-mkt-program.dto';
import { UpdateMarketingProgramDto } from './dto/update-mkt-program.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketingProgramEntity } from './entities/marketing-program.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { CampaignsService } from '../campaigns/campaigns.service';
import { MktProgramQueryDto } from './dto/query-mkt-program.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';

@Injectable()
export class MarketingProgramsService {
  private readonly logger = new Logger(MarketingProgramsService.name);

  constructor(
    @InjectRepository(MarketingProgramEntity)
    private mktProgramRepo: Repository<MarketingProgramEntity>,
    private readonly cloudinaryService: CloudinaryService,

    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,

    @Inject(forwardRef(() => CampaignsService))
    private readonly campaignService: CampaignsService,

    private dataSource: DataSource,
  ) {}

  async create(dto: CreateMarketingProgramDto) {
    try {
      const { name, campaigns: campaignIds, startDate, endDate, ...rest } = dto;

      //
      if (startDate >= endDate) {
        throw new BadGatewayException('Start date must be before end date');
      }

      //
      const slug = stringToSlug(name);
      const existingCampaign = await this.mktProgramRepo.exists({ where: { slug } });
      if (existingCampaign) {
        throw new ConflictException('A marketing program with the same name already exists');
      }

      //
      if (campaignIds && campaignIds?.length > 0) {
        const campaignsExist = await this.campaignService.exists(campaignIds);
        if (!campaignsExist) {
          throw new NotFoundException(`One or more Campaign IDs not found`);
        }
      }

      const marketingProgram = this.mktProgramRepo.create({
        ...rest,
        name,
        slug,
        startDate,
        endDate,
        campaigns: campaignIds ? campaignIds.map((id) => ({ id })) : [],
      });
      return await this.mktProgramRepo.save(marketingProgram);
    } catch (error) {
      await this.removeImagesForError([dto?.mainImage.key]);
      this.logger.error(`Failed to create brand`, error);
      throw error;
    }
  }

  async findAll(query: MktProgramQueryDto) {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.mktProgramRepo
      .createQueryBuilder('mktProgram')

      // Join các quan hệ
      .leftJoinAndSelect('mktProgram.campaigns', 'campaigns')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'mktProgram.id',
        'mktProgram.name',
        'mktProgram.slug',
        'mktProgram.desc',
        'mktProgram.status',
        'mktProgram.mainImage',
        'mktProgram.startDate',
        'mktProgram.endDate',
        'mktProgram.createdAt',

        // Trường hợp ít campaign, nếu nhiều không join và select,
        // Mà để FE gọi API riêng lấy campaign theo mktProgramId
        'campaigns.id',
        'campaigns.name',
      ])

      // Phân trang và sắp xếp
      .orderBy('mktProgram.createdAt', 'DESC') // Nên có orderBy khi phân trang
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    //
    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: MktProgramQueryDto): Promise<IMetadata<MarketingProgramEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.mktProgramRepo
      .createQueryBuilder('mktProgram')
      .select(['mktProgram.id', 'mktProgram.name', 'mktProgram.mainImage', 'mktProgram.slug'])
      .skip(skip)
      .take(take)
      .orderBy('mktProgram.createdAt', 'DESC');

    //
    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = await this.signUrl(data);

    //
    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    const campaign = await this.mktProgramRepo.findOne({
      where: { id },
      relations: ['campaigns'],
    });

    const mainImage = campaign?.mainImage || '';
    const mainImageData = mainImage ? await this.cloudinaryService.generateImage(mainImage) : undefined;
    if (mainImageData) {
      campaign!.mainImage = mainImageData;
    }

    return campaign;
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.mktProgramRepo.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async update(id: string, dto: UpdateMarketingProgramDto) {
    const { name, startDate, endDate, mainImage, campaigns: campaignIds, ...rest } = dto;

    // ==========================================
    // 1. VALIDATION & READS (Ngoài Transaction để giải phóng DB nhanh)
    // ==========================================

    // Validate ngày tháng ngay lập tức, tránh đụng vào DB nếu dữ liệu lỗi
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Lấy dữ liệu cũ để check tồn tại và lấy key ảnh
    const oldMarketingProgram = await this.mktProgramRepo.findOne({
      where: { id },
      select: { id: true, mainImage: true },
    });
    if (!oldMarketingProgram) {
      throw new NotFoundException(`Marketing program not found`);
    }

    const slug = name ? stringToSlug(name) : undefined;
    const hasCampaigns = campaignIds && campaignIds.length > 0;

    // Chạy song song các câu lệnh check độc lập
    const [isSlugDup, isCampaignValid] = await Promise.all([
      name ? this.mktProgramRepo.exists({ where: { slug, id: Not(id) } }) : null,
      hasCampaigns ? this.campaignService.exists(campaignIds) : null,
    ]);

    if (isSlugDup) throw new ConflictException('A marketing program with the same name already exists');
    if (hasCampaigns && !isCampaignValid) throw new BadRequestException(`One or more Campaign ids not found`);

    // ==========================================
    // 2. TRANSACTION (Chỉ bọc các hành động ghi - WRITE)
    // ==========================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge dữ liệu mới vào thực thể cũ
      const updatedMarketingProgram = this.mktProgramRepo.merge(oldMarketingProgram, {
        ...rest,
        ...(name && { name, slug }),
        ...(endDate && { endDate }),
        ...(startDate && { startDate }),
        ...(campaignIds && { campaigns: campaignIds.map((cId) => ({ id: cId })) }),
      });

      if (mainImage !== undefined) {
        updatedMarketingProgram.mainImage = mainImage;
      }

      // Lưu vào DB qua transaction manager
      await queryRunner.manager.save(MarketingProgramEntity, updatedMarketingProgram);

      // Chỉ commit khi DB hoàn tất
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Nếu DB lỗi, dọn dẹp các ảnh MỚI vừa được upload lên (nếu có) trước đó ngoài API
      const newKeys = [mainImage?.key].filter((k): k is string => !!k);
      if (newKeys.length > 0) {
        await this.removeImagesForError(newKeys).catch((err) =>
          this.logger.error(`Failed to cleanup new images on error`, err),
        );
      }

      this.logger.error(`Failed to update marketing program`);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ==========================================
    // 3. CLEANUP CLOUDINARY (Sau khi DB thành công 100%)
    // ==========================================
    // Chỉ chạy sau khi commit thành công để tránh mất ảnh nếu DB rollback
    try {
      const oldMainImageKey = oldMarketingProgram.mainImage?.key;

      // Xóa mainImage cũ
      if ((mainImage !== undefined && oldMainImageKey) || mainImage === null) {
        await this.cloudinaryQueue.add(
          'delete-image',
          { publicId: oldMainImageKey },
          { jobId: `delete-${oldMainImageKey}-${Date.now()}` },
        );
      }
    } catch (cloudError) {
      this.logger.warn(`Database updated but failed to delete some old images from Cloudinary`, cloudError);
    }
  }

  async remove(id: string) {
    const marketingProgram = await this.findOne(id);
    if (!marketingProgram) {
      throw new NotFoundException(`Marketing program with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước
    await this.mktProgramRepo.remove(marketingProgram);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (marketingProgram.mainImage) {
      await this.cloudinaryQueue.add(
        'delete-multiple-images',
        { publicIds: [marketingProgram.mainImage.key] },
        { jobId: `delete-bulk-${Date.now()}` },
      );
    }

    return true;
  }

  private async removeImagesForError(keys?: string[]) {
    if (!keys || keys.length === 0) return;
    return await this.cloudinaryQueue.add(
      'delete-multiple-images',
      { publicIds: keys },
      { jobId: `delete-bulk-${Date.now()}` },
    );
  }

  private async signUrl(data: MarketingProgramEntity[]): Promise<MarketingProgramEntity[]> {
    return await Promise.all(
      data.map(async (item) => {
        const mainImageData = item.mainImage ? await this.cloudinaryService.generateImage(item.mainImage) : undefined;
        return {
          ...item,
          mainImage: {
            ...mainImageData,
          },
        } as MarketingProgramEntity;
      }),
    );
  }
}
