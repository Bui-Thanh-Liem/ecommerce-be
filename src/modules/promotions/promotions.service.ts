import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { In, Repository } from 'typeorm';
import { ProductVariantsService } from '../product-variants-SKU/product-variants.service';
import { CampaignsService } from '../campaigns/campaigns.service';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(PromotionEntity)
    private promotionRepository: Repository<PromotionEntity>,

    private readonly pvService: ProductVariantsService,
    private readonly campaignsService: CampaignsService,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    const { productHighlighted: productHighlightedIds, campaign: campaignId, ...rest } = createPromotionDto;

    //
    const pvExists = await this.pvService.exists(productHighlightedIds);
    if (!pvExists) {
      throw new NotFoundException(`One or more ProductVariant IDs not found: ${productHighlightedIds.join(', ')}`);
    }

    //
    const campaignExists = await this.campaignsService.exists([campaignId]);
    if (!campaignExists) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    //
    const pvExisting = await this.pvService.exists(productHighlightedIds);
    if (pvExisting) {
      throw new NotFoundException(`One or more ProductVariants are already highlighted in another promotion`);
    }

    const promotion = this.promotionRepository.create({
      ...rest,
      campaign: { id: campaignId },
      productHighlighted: productHighlightedIds.map((id) => ({ id })),
    });
    return await this.promotionRepository.save(promotion);
  }

  async findAll() {
    return await this.promotionRepository.find({ relations: ['campaign', 'productHighlighted'] });
  }

  async findOne(id: string) {
    return await this.promotionRepository.findOne({ where: { id }, relations: ['campaign', 'productHighlighted'] });
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.promotionRepository.count({ where: { id: In(ids) } });
    return count === ids.length;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const { productHighlighted: productHighlightedIds, campaign: campaignId, ...rest } = updatePromotionDto;

    //
    if (productHighlightedIds && productHighlightedIds.length > 0) {
      const pvExists = await this.pvService.exists(productHighlightedIds);
      if (!pvExists) {
        throw new NotFoundException(`One or more ProductVariant IDs not found: ${productHighlightedIds.join(', ')}`);
      }
    }

    //
    if (campaignId) {
      const campaignExists = await this.campaignsService.exists([campaignId]);
      if (!campaignExists) {
        throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
      }
    }

    //
    const promotion = await this.promotionRepository.preload({
      id,
      ...rest,
      campaign: campaignId ? { id: campaignId } : undefined,
      productHighlighted: productHighlightedIds ? productHighlightedIds.map((id) => ({ id })) : undefined,
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: string) {
    const promotion = await this.findOne(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return await this.promotionRepository.remove(promotion);
  }
}
