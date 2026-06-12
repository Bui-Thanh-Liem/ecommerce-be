import { IVariantAttribute } from '@/shared/interfaces/models/catalog/product-variant.interface';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ProductCodeService {
  /**
   * Sinh mã SPU
   * Format: [CATEGORY]-[BRAND]-[MODEL]
   * Xử lý xóa khoảng trắng, ký tự đặc biệt của Model
   */
  generateSPUCode(categoryCode: string, brandCode: string, model: string): string {
    const cleanCategory = categoryCode
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]/g, '');
    const cleanBrand = brandCode
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]/g, '');
    const cleanModel = model
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]/g, '');

    return `${cleanCategory}-${cleanBrand}-${cleanModel}`;
  }

  /**
   * Sinh mã SKU thực tế
   * Format: [SPU]-[ATTRIBUTES_CODE]
   * Ví dụ: DT-APL-IPHONE-BLK128
   */
  generateSKUCode(spuCode: string, salesAttributes: IVariantAttribute[]): string {
    if (!salesAttributes || salesAttributes.length === 0) {
      throw new BadRequestException('Sales attributes không được để trống khi tạo SKU');
    }

    // 1. Lấy mã 'key' viết tắt của các thuộc tính, viết hoa và làm sạch
    const attrParts = salesAttributes.map((attr) => {
      if (!attr.key) {
        // Fallback nếu không có trường code thì tự convert slug từ value, nhưng khuyên dùng trường code riêng
        return attr.value.toUpperCase().replace(/\s+/g, '');
      }
      return attr.key
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9]/g, '');
    });

    // 2. Ghép lại thành một chuỗi mã thuộc tính duy nhất (Ví dụ: BLK128)
    const attributesString = attrParts.join('');

    // 3. Trả về mã SKU hoàn chỉnh (Không cần SEQUENCE đuôi)
    return `${spuCode}-${attributesString}`;
  }
}
