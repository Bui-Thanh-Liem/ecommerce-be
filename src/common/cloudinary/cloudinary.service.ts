import { IImage } from '@/shared/interfaces/common/image.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, SignApiOptions, TransformationOptions } from 'cloudinary';
import { Queue } from 'bullmq';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectQueue('cloudinary')
    private readonly cloudinaryQueue: Queue,
    private cacheService: CacheService,
  ) {}

  /**
   * 1. GENERATE SIGNATURE (Bảo mật cho Client-side Upload)
   * Giúp Client tự upload lên Cloudinary mà không lộ API Secret, giảm tải cho Server.
   */
  generateSignature(folder: string) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      const paramsToSign: SignApiOptions = {
        timestamp: timestamp,
        folder: folder,
      };

      const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret || '');

      return {
        folder,
        signature,
        timestamp,
        api_key: cloudinary.config().api_key,
        cloud_name: cloudinary.config().cloud_name,
      };
    } catch (error) {
      console.log('Error generating signature:', error);
      throw new InternalServerErrorException('Không thể tạo signature cho Cloudinary');
    }
  }

  /**
   * 2. GENERATE OPTIMIZED URL (Chuẩn SEO & Performance)
   * Tự động optimize dung lượng, định dạng (WebP/AVIF) dựa trên trình duyệt của user.
   */
  async generateUrl(publicId: string, customOptions?: TransformationOptions): Promise<string> {
    if (!publicId) return '';

    const cachedUrl = await this.cacheService.get<string>(publicId);

    if (cachedUrl) return cachedUrl;

    const defaultOptions: TransformationOptions = {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      sign_url: true, // KÍCH HOẠT CHỮ KÝ SỐ (BẮT BUỘC ĐỂ HẾT LỖI 401)
    };

    const url = cloudinary.url(publicId, {
      ...defaultOptions,
      ...(customOptions && typeof customOptions === 'object' && { ...customOptions }), // Cho phép ghi đè size (width, height), crop,... nếu cần
    });

    // Cache URL trong Redis với TTL 24h (86,400,000 ms)
    await this.cacheService.set(publicId, url, 86_400_000);

    return url;
  }

  /**
   * 3. GENERATE OPTIMIZED URL (Chuẩn SEO & Performance)
   * Tự động optimize dung lượng, định dạng (WebP/AVIF) dựa trên trình duyệt của user.
   */
  async generateUrls(images: IImage[], customOptions?: TransformationOptions): Promise<IImage[]> {
    if (!images || images.length === 0) return [];

    const defaultOptions: TransformationOptions = {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      sign_url: true, // KÍCH HOẠT CHỮ KÝ SỐ (BẮT BUỘC ĐỂ HẾT LỖI 401)
    };

    const finalOptions = {
      ...defaultOptions,
      ...(customOptions && typeof customOptions === 'object' && { ...customOptions }), // Cho phép ghi đè size (width, height), crop,... nếu cần
    };

    // Duyệt qua mảng images và xử lý song song từng đối tượng
    const imageSignedPromises = images.map(async (image) => {
      // 1. Kiểm tra cache bằng image.key (hoặc publicId tùy cách bạn đặt tên thuộc tính)
      const cachedUrl = await this.cacheService.get<string>(image.key);

      if (cachedUrl) {
        return {
          ...image,
          url: cachedUrl,
        };
      }

      // 2. Nếu hụt cache, tạo URL mới từ Cloudinary
      const url = cloudinary.url(image.key, finalOptions);

      // 3. Cache URL trong Redis với TTL 24h (86,400,000 ms)
      await this.cacheService.set(image.key, url, 86_400_000);

      return {
        ...image,
        url: url,
      };
    });

    // Đợi tất cả các thuộc tính xử lý xong và trả về mảng IImage[] đúng thứ tự
    return Promise.all(imageSignedPromises);
  }

  /**
   * 4. XÓA MỘT FILE ĐƠN LẺ (Delete Single Asset)
   * @param publicId ID định danh của file trên Cloudinary (ví dụ: 'products/chair_123')
   * Add job vào queue - xử lý trên worker process riêng
   */
  async deleteImage(publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID không được để trống');
    }

    try {
      const result = (await cloudinary.uploader.destroy(publicId)) as CloudinaryDestroyResponse;

      if (result.result !== 'ok' && result.result !== 'not_found') {
        throw new Error(`Unexpected Cloudinary response: ${result.result}`);
      }

      return { success: true, result: result.result, publicId };
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 5. XÓA HÀNG LOẠT FILE (Bulk Delete Assets)
   * @param publicIds Mảng chứa các ID cần xóa (tối đa 100 IDs trong 1 request)
   * Add job vào queue - xử lý trên worker process riêng
   */
  async deleteMultipleImages(publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Danh sách Public IDs không được rỗng');
    }

    try {
      const response = (await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image',
      })) as CloudinaryDeleteResourcesResponse;

      return response;
    } catch (error) {
      throw new Error(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

interface CloudinaryDestroyResponse {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  result: 'ok' | 'not_found' | string;
}

interface CloudinaryDeleteResourcesResponse {
  deleted: Record<string, 'deleted' | 'not_found'>;
  partial: boolean;
}
