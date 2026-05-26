import { IImage } from '@/shared/interfaces/image.interface';
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, SignApiOptions, UploadApiResponse, TransformationOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
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
   */
  async uploadImage(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(new InternalServerErrorException(`Cloudinary Upload Failed: ${error.message}`));
          }

          if (result) {
            resolve(result);
          }
        },
      );

      // Ghi buffer vào stream để upload
      uploadStream.end(file.buffer);
    });
  }

  /**
   * 3. GENERATE OPTIMIZED URL (Chuẩn SEO & Performance)
   * Tự động optimize dung lượng, định dạng (WebP/AVIF) dựa trên trình duyệt của user.
   */
  generateUrl(publicId: string, customOptions?: TransformationOptions): string {
    if (!publicId) {
      throw new BadRequestException('Public ID không hợp lệ');
    }

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

    // TODO: cache (redis)
    return url;
  }

  /**
   * 3.3. GENERATE OPTIMIZED URL (Chuẩn SEO & Performance)
   * Tự động optimize dung lượng, định dạng (WebP/AVIF) dựa trên trình duyệt của user.
   */
  generateUrls(images: IImage[], customOptions?: TransformationOptions): IImage[] {
    if (!images || images.length === 0) {
      throw new BadRequestException('Images không hợp lệ');
    }

    const defaultOptions: TransformationOptions = {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      sign_url: true, // KÍCH HOẠT CHỮ KÝ SỐ (BẮT BUỘC ĐỂ HẾT LỖI 401)
    };

    const imageSigned = images.map((image) => {
      return {
        ...image,
        url: cloudinary.url(image.key, {
          ...defaultOptions,
          ...(customOptions && typeof customOptions === 'object' && { ...customOptions }), // Cho phép ghi đè size (width, height), crop,... nếu cần
        }),
      };
    });

    // TODO: cache (redis)
    return imageSigned;
  }

  /**
   * 4. XÓA MỘT FILE ĐƠN LẺ (Delete Single Asset)
   * @param publicId ID định danh của file trên Cloudinary (ví dụ: 'products/chair_123')
   */
  async deleteImage(publicId: string): Promise<CloudinaryDestroyResponse> {
    if (!publicId) {
      throw new BadRequestException('Public ID không được để trống');
    }

    try {
      // 2. Gọi thẳng await mà không cần bọc new Promise()
      const result = (await cloudinary.uploader.destroy(publicId)) as CloudinaryDestroyResponse;

      // Cloudinary trả về { result: 'ok' } nếu xóa thành công, hoặc { result: 'not_found' } nếu không tìm thấy file
      if (result.result !== 'ok' && result.result !== 'not_found') {
        throw new InternalServerErrorException(`Cloudinary trả về trạng thái lạ: ${result.result}`);
      }

      return result;
    } catch (error) {
      // Tránh lỗi gán 'any' khi bắt catch error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Xóa file thất bại: ${errorMessage}`);
    }
  }

  /**
   * 5. XÓA HÀNG LOẠT FILE (Bulk Delete Assets)
   * @param publicIds Mảng chứa các ID cần xóa (tối đa 100 IDs trong 1 request)
   */
  async deleteMultipleImages(publicIds: string[]): Promise<CloudinaryDeleteResourcesResponse> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Danh sách Public IDs không được rỗng');
    }

    try {
      // Dùng hàm Admin API để xóa nhiều file cùng lúc nhằm tối ưu hiệu năng mạng (Network I/O)
      const response = (await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image',
      })) as CloudinaryDeleteResourcesResponse;

      return response;
    } catch (error) {
      throw new InternalServerErrorException(`Xóa hàng loạt thất bại: ${(error as Error).message}`);
    }
  }
}

interface CloudinaryDeleteResourcesResponse {
  deleted: Record<string, 'deleted' | 'not_found'>;
  partial: boolean;
}

interface CloudinaryDestroyResponse {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  result: 'ok' | 'not_found' | string;
}
