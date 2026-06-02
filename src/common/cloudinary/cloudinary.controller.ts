import { Controller, Post, Query, Body, Delete } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { SignatureDto } from './dto/signature-upload-url.dto';
import { Serializer } from '@/interceptors/serializer.interceptor';
import { ResSignatureDto } from './dto/res-signature.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectQueue('cloudinary') private readonly cloudinaryQueue: Queue,
  ) {}

  /**
   * API lấy Signature để Client tự upload trực tiếp lên Cloudinary
   */
  @Serializer(ResSignatureDto)
  @Post('signature')
  getUploadSignature(@Body() body: SignatureDto) {
    const targetFolder = body?.folder || 'signatures';
    return this.cloudinaryService.generateSignature(targetFolder);
  }

  /**
   * API Xóa một file duy nhất
   * Returns ngay với jobId - không chờ xóa xong
   */
  @Delete()
  async deleteFile(@Query('public_id') publicId: string) {
    return await this.cloudinaryService.deleteImage(publicId);
  }
}
