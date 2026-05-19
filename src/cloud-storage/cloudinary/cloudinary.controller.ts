import { Controller, Post, Get, Query, UseInterceptors, UploadedFile, Body, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { SignatureDto } from './dto/signature-upload-url.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ResSignature } from './dto/res-signature.dto';

@Serializer(ResSignature)
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * API lấy Signature để Client tự upload trực tiếp lên Cloudinary
   */
  @Post('signature')
  getUploadSignature(@Body() body: SignatureDto) {
    const targetFolder = body?.folder || 'signatures';
    return this.cloudinaryService.generateSignature(targetFolder);
  }

  /**
   * API Upload ảnh trực tiếp từ Server bằng Buffer (Dùng Multer)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('folder') folder: string) {
    const targetFolder = folder || 'uploadFile';
    const result = await this.cloudinaryService.uploadImage(file, targetFolder);

    // Trả về dữ liệu chuẩn production, kết hợp tối ưu URL ngay khi upload xong
    return {
      public_id: result.public_id,
      original_url: result.secure_url,
      optimized_url: this.cloudinaryService.generateUrl(result.public_id),
    };
  }

  /**
   * API lấy URL ảnh đã qua tối ưu hoặc resize động dựa trên public_id
   */
  @Get('transform')
  getOptimizedUrl(
    @Query('public_id') publicId: string,
    @Query('width') width?: number,
    @Query('height') height?: number,
  ) {
    const options = width && height ? { width, height, crop: 'fill' } : {};
    const url = this.cloudinaryService.generateUrl(publicId, options);
    return { url };
  }

  /**
   * API Xóa một file duy nhất
   * DELETE http://localhost:3000/media?public_id=products/chair_123
   */
  @Delete()
  async deleteFile(@Query('public_id') publicId: string) {
    const res = await this.cloudinaryService.deleteImage(publicId);
    return {
      success: true,
      message: res.result === 'ok' ? 'Xóa file thành công' : 'File không tồn tại trên Cloudinary',
    };
  }

  /**
   * API Xóa hàng loạt file (Bulk Delete)
   * DELETE http://localhost:3000/media/bulk
   * Body: { "public_ids": ["products/img1", "products/img2"] }
   */
  @Delete('bulk')
  async deleteMultipleFiles(@Body('public_ids') publicIds: string[]) {
    const res = await this.cloudinaryService.deleteMultipleImages(publicIds);
    return {
      success: true,
      message: 'Yêu cầu xử lý xóa hoàn tất',
      details: res.deleted, // Trả về chi tiết xem ID nào đã bị xóa thành công
    };
  }
}
