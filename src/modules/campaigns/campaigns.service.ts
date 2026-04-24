import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CampaignEntity } from './entities/campaign.entity';
import { In, Repository } from 'typeorm';
import { PromotionsService } from '../promotions/promotions.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,

    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionService: PromotionsService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto) {
    const { promotions: promotionIds, ...rest } = createCampaignDto;

    //
    const promotionsExist = await this.promotionService.exists(promotionIds);
    if (!promotionsExist) {
      throw new NotFoundException(`One or more Promotion IDs not found: ${promotionIds.join(', ')}`);
    }

    const campaign = this.campaignRepository.create({
      ...rest,
      promotions: promotionIds.map((id) => ({ id })),
    });
    return await this.campaignRepository.save(campaign);
  }

  async findAll() {
    return await this.campaignRepository.find({ relations: ['promotions'] });
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
    const { promotions: promotionIds, ...rest } = updateCampaignDto;

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
      promotions: promotionIds ? promotionIds.map((id) => ({ id })) : undefined,
    });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return await this.campaignRepository.save(campaign);
  }

  async remove(id: string) {
    const campaign = await this.findOne(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return await this.campaignRepository.remove(campaign);
  }
}
