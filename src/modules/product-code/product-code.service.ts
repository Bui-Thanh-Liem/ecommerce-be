import { IVariantAttribute } from '@/shared/interfaces/models/product-variant.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductCodeService {
  /**
   * Format: [CATEGORY]-[BRAND]-[SLUG]-[YYYY]-[SEQUENCE]
   * Ví dụ: DT-APL-SLUG-2026-0001
   */
  generateSPUCode(categoryCode: string, brandCode: string, slug: string, sequence: number): string {
    const year = new Date().getFullYear();
    const formattedSeq = sequence.toString().padStart(4, '0'); // Đảm bảo đủ 4 chữ số
    const formattedSlug = slug
      .split('-')
      .map((word) => word.substring(0, 2).toUpperCase())
      .join('-');
    return `${categoryCode}-${brandCode}-${formattedSlug}-${year}-${formattedSeq}`;
  }

  /**
   * Format: [SPU]-[SKU-SPEC1]-[SKU-SPEC2]-...
   * Ví dụ: DT-APL-SLUG-2026-0001-BLU128
   */
  generateSKUCode(spuCode: string, salesAttributes: IVariantAttribute[]): string {
    //
    const variantItems = salesAttributes.flatMap((attr) => attr.value);
    // eslint-disable-next-line max-len
    const skuParts = variantItems.map((item) => `${item}`.toUpperCase().replace(/\s+/g, '')); // Loại bỏ khoảng trắng và chuyển thành chữ hoa
    return `${spuCode}-${skuParts.join('-')}`;
  }
}
