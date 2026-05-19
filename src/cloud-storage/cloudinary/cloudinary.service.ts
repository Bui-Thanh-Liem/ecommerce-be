import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, SignApiOptions, UploadApiResponse, TransformationOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * 1. GENERATE SIGNATURE (Bảo mật cho Client-side Upload)
   * Giúp Client tự upload lên Cloudinary mà không lộ API Secret, giảm tải cho Server.
   */
  generateSignature(folder: string, ttlInSeconds = 3600) {
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

    // Các option mặc định chuẩn Prod để tối ưu hóa performance và dung lượng ảnh
    const defaultOptions: TransformationOptions = {
      quality: 'auto', // Tự động nén ảnh tối ưu nhất mà không giảm chất lượng mắt thường thấy
      fetch_format: 'auto', // Tự động chuyển đổi sang WebP/AVIF tùy trình duyệt khách
      secure: true,
    };

    return cloudinary.url(publicId, {
      ...defaultOptions,
      ...(customOptions && typeof customOptions === 'object' && { ...customOptions }), // Cho phép ghi đè size (width, height), crop,... nếu cần
    });
  }

  /**
   * 4. XÓA MỘT FILE ĐƠN LẺ (Delete Single Asset)
   * @param publicId ID định danh của file trên Cloudinary (ví dụ: 'products/chair_123')
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException('Public ID không được để trống');
    }

    return new Promise((resolve, reject) => {
      // Mặc định resource_type là 'image'. Nếu bạn xóa video, cần truyền thêm { resource_type: 'video' }
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(new InternalServerErrorException(`Xóa file thất bại: ${error.message}`));
        }

        // Cloudinary trả về { result: 'ok' } nếu xóa thành công, hoặc { result: 'not_found' } nếu sai ID
        if (result.result !== 'ok' && result.result !== 'not_found') {
          return reject(new InternalServerErrorException(`Cloudinary trả về lỗi: ${result.result}`));
        }

        resolve(result);
      });
    });
  }

  /**
   * 5. XÓA HÀNG LOẠT FILE (Bulk Delete Assets)
   * @param publicIds Mảng chứa các ID cần xóa (tối đa 100 IDs trong 1 request)
   */
  async deleteMultipleImages(publicIds: string[]): Promise<any> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Danh sách Public IDs không được rỗng');
    }

    try {
      // Dùng hàm Admin API để xóa nhiều file cùng lúc nhằm tối ưu hiệu năng mạng (Network I/O)
      const response = await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image',
      });

      return response;
    } catch (error) {
      throw new InternalServerErrorException(`Xóa hàng loạt thất bại: ${error.message}`);
    }
  }
}
