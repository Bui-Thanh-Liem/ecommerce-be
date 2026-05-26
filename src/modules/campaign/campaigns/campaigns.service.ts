import { CloudinaryService } from '@/cloud-storage/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignQueryDto } from './dto/query-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignEntity } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionService: PromotionsService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto) {
    try {
      const { promotions: promotionIds, name, startDate, endDate, ...rest } = createCampaignDto;

      //
      if (startDate >= endDate) {
        throw new NotFoundException('Start date must be before end date');
      }

      //
      const slug = stringToSlug(name);
      const existingCampaign = await this.campaignRepository.exists({ where: { slug } });
      if (existingCampaign) {
        throw new NotFoundException('A campaign with the same name already exists');
      }

      //
      if (promotionIds && promotionIds?.length > 0) {
        const promotionsExist = await this.promotionService.exists(promotionIds);
        if (!promotionsExist) {
          throw new NotFoundException(`One or more Promotion IDs not found: ${promotionIds.join(', ')}`);
        }
      }

      const campaign = this.campaignRepository.create({
        ...rest,
        name,
        slug,
        startDate,
        endDate,
        promotions: promotionIds?.map((id) => ({ id })) || [],
      });
      return await this.campaignRepository.save(campaign);
    } catch (error) {
      const keys = [...(createCampaignDto?.images?.map((img) => img.key) || []), createCampaignDto?.mainImage.key];
      await this.removeImagesForError(keys);
      this.logger.debug(`Failed to create brand`, error);
      throw error;
    }
  }

  async findAll(query: CampaignQueryDto): Promise<IMetadata<CampaignEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')

      // Join các quan hệ
      .leftJoinAndSelect('campaign.promotions', 'promotions')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'campaign.id',
        'campaign.name',
        'campaign.slug',
        'campaign.desc',
        'campaign.isActive',
        'campaign.mainImage',
        'campaign.images',
        'campaign.startDate',
        'campaign.endDate',
        'campaign.createdAt',

        'promotions.id',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('campaign.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    const dataWithUrls = data.map((cam) => {
      const imageKeys = cam.images || [];
      const mainImageKey = cam.mainImage?.key;
      const mainImageUrl = this.cloudinaryService.generateUrl(mainImageKey);
      const images = this.cloudinaryService.generateUrls(imageKeys);

      return {
        ...cam,
        images: images,
        mainImage: {
          ...cam.mainImage,
          url: mainImageUrl,
        },
      } as CampaignEntity;
    });

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    return await this.campaignRepository.findOne({
      where: { id },
      relations: ['promotions'],
    });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.campaignRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    try {
      const { promotions: promotionIds, name, startDate, endDate, ...rest } = updateCampaignDto;

      //
      if (startDate && endDate && startDate >= endDate) {
        throw new NotFoundException('Start date must be before end date');
      }

      //
      let slug: string | undefined = undefined;
      if (name) {
        slug = stringToSlug(name);
        const existingCampaign = await this.campaignRepository.exists({ where: { slug, id: Not(id) } });
        if (existingCampaign) {
          throw new NotFoundException('A campaign with the same name already exists');
        }
      }

      //
      if (promotionIds && promotionIds.length > 0) {
        const promotionsExist = await this.promotionService.exists(promotionIds);
        if (!promotionsExist) {
          throw new NotFoundException(`One or more Promotion IDs not found: ${promotionIds.join(', ')}`);
        }
      }

      const campaign = await this.campaignRepository.preload({
        id,
        ...rest,
        slug,
        endDate,
        startDate,
        name: name ? name : undefined,
        promotions: promotionIds ? promotionIds.map((id) => ({ id })) : undefined,
      });
      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }
      return await this.campaignRepository.save(campaign);
    } catch (error) {
      const keys = [...(updateCampaignDto?.images?.map((img) => img.key) || []), updateCampaignDto?.mainImage?.key];
      await this.removeImagesForError(keys.filter((key): key is string => !!key));
      this.logger.debug(`Failed to update campaign`, error);
      throw error;
    }
  }

  async remove(id: string) {
    const campaign = await this.findOne(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return await this.campaignRepository.remove(campaign);
  }

  private removeImagesForError(keys?: string[]) {
    if (!keys || keys.length === 0) return;
    return this.cloudinaryService.deleteMultipleImages(keys);
  }
}
