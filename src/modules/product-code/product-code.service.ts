import { ISpecification } from '@/shared/interfaces/models/product-variant.interface';
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
    return `${categoryCode}-${brandCode}-${slug.toLocaleUpperCase()}-${year}-${formattedSeq}`;
  }

  /**
   * Format: [SPU]-[SKU-SPEC1]-[SKU-SPEC2]-...
   * Ví dụ: DT-APL-SLUG-2026-0001-BLU128
   */
  generateSKUCode(spuCode: string, specifications: ISpecification[]): string {
    //
    const variantItems = specifications.flatMap((spec) => spec.items);
    // eslint-disable-next-line max-len
    const variantSKUs = variantItems.filter((item) => item.isSKU).slice(0, 5); // Chỉ lấy tối đa 5 thuộc tính để tạo SKU, tránh quá dài
    const skuParts = variantSKUs.map((item) => `${item.value}`.toUpperCase().replace(/\s+/g, '')); // Loại bỏ khoảng trắng và chuyển thành chữ hoa
    return `${spuCode}-${skuParts.join('-')}`;
  }
}
