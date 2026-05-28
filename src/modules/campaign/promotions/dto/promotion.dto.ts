import { ResponseImageDto } from '@/shared/dtos/res/response-image.dto';
import { Expose, Type } from 'class-transformer';
import { CampaignDto } from '../../campaigns/dto/campaign.dto';
import { PromotionApplyType } from '@/shared/enums/promotion-apply-type.enum';
import { PromotionApplyScope } from '@/shared/enums/promotion-apply-scope.enum';
import { ProductVariantSKUDto } from '@/modules/catalog/product-variants-SKU/dto/product-variant-SKU.dto';
import { StoreDto } from '@/modules/inventory/stores/dto/store.dto';
import { LocationRegionDto } from '@/modules/inventory/location-regions/dto/location-region.dto';

export class PromotionDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  isActive: boolean;

  @Expose()
  applyType: PromotionApplyType;

  @Expose()
  applyScope: PromotionApplyScope;

  @Expose()
  discountPercentage: number;

  @Expose()
  limitQuantity: number;

  @Expose()
  totalSoldQuantity: number;

  @Expose()
  @Type(() => ProductVariantSKUDto)
  productHighlighted: ProductVariantSKUDto[];

  @Expose()
  @Type(() => StoreDto)
  stores: StoreDto[];

  @Expose()
  @Type(() => LocationRegionDto)
  locations: LocationRegionDto;

  // @Expose()
  // @Type(() => ProductPromotionDto)
  // productPromotions: ProductPromotionDto[];

  // @Expose()
  // @Type(() => CategoryPromotionDto)
  // categoryPromotions: CategoryPromotionDto[];

  @Expose()
  @Type(() => ResponseImageDto)
  image: ResponseImageDto;

  @Expose()
  @Type(() => CampaignDto)
  campaign: CampaignDto;
}
