import { IImage } from '@/shared/interfaces/image.interface';
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
   * 2. UPLOAD IMAGE FROM SERVER (Dành cho việc upload file qua Interceptor của NestJS)
   * Nhận vào Buffer từ Express.Multer.File
   * Add job vào queue - xử lý trên worker process riêng
   */
  async uploadImage(file: Express.Multer.File, folder: string) {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    const job = await this.cloudinaryQueue.add(
      'upload-image',
      {
        fileBuffer: file.buffer,
        originalname: file.originalname,
        folder: folder,
      },
      {
        jobId: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    );

    return {
      jobId: job.id,
      status: 'processing',
      message: 'Upload đang được xử lý trên worker process',
    };
  }

  /**
   * 3. GENERATE OPTIMIZED URL (Chuẩn SEO & Performance)
   * Tự động optimize dung lượng, định dạng (WebP/AVIF) dựa trên trình duyệt của user.
   */
  async generateUrl(publicId: string, customOptions?: TransformationOptions): Promise<string> {
    if (!publicId) throw new BadRequestException('Public ID không hợp lệ');

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
   * 3.3. GENERATE OPTIMIZED URL (Chuẩn SEO & Performance)
   * Tự động optimize dung lượng, định dạng (WebP/AVIF) dựa trên trình duyệt của user.
   */
  async generateUrls(images: IImage[], customOptions?: TransformationOptions): Promise<IImage[]> {
    if (!images || images.length === 0) {
      throw new BadRequestException('Images không hợp lệ');
    }

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

    const job = await this.cloudinaryQueue.add(
      'delete-image',
      { publicId },
      { jobId: `delete-${publicId}-${Date.now()}` },
    );

    return {
      jobId: job.id,
      status: 'processing',
      message: 'Xóa file đang được xử lý trên worker process',
    };
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

    const job = await this.cloudinaryQueue.add(
      'delete-multiple-images',
      { publicIds },
      { jobId: `delete-bulk-${Date.now()}` },
    );

    return {
      jobId: job.id,
      status: 'processing',
      message: `Đang xử lý xóa ${publicIds.length} file trên worker process`,
    };
  }
}
