import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { S3_CLIENT } from '@/shared/constants/s3.constant';

@Injectable()
export class S3Service {
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor(@Inject(S3_CLIENT) private readonly s3Client: S3Client) {}

  // 1. Upload file trực tiếp từ Server
  async uploadFile(file: Express.Multer.File, key: string) {
    const command = new PutObjectCommand({
      Key: key,
      Body: file.buffer,
      Bucket: this.bucketName,
      ContentType: file.mimetype,
    });
    return this.s3Client.send(command);
  }

  // 2. Tạo link để xem file (Private Bucket)
  async getPresignedUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  // 3. Xóa file
  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return this.s3Client.send(command);
  }

  /**
   * Tạo URL để Client upload trực tiếp lên S3
   * @param key Đường dẫn file trên S3 (vd: uploads/user-1/avatar.png)
   * @param contentType Loại file (image/jpeg, video/mp4,...)
   * @param expiresIn Thời gian hết hạn của link (giây) - Mặc định 5 phút
   */
  async createUploadUrl({ key, contentType, expiresIn = 300 }: CreateUploadUrlDto) {
    const command = new PutObjectCommand({
      Key: key,
      Bucket: this.bucketName,
      ContentType: contentType, // Quan trọng: Client phải gửi đúng loại này khi upload
    });

    // Trả về một chuỗi URL
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    return {
      uploadUrl,
      key, // Lưu key này vào DB sau khi client upload thành công
    };
  }
}
