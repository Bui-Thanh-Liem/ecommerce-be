import { Controller, Post, Body, Delete } from '@nestjs/common';
import { S3Service } from './s3.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-url')
  createUploadUrl(@Body() createUploadUrlDto: CreateUploadUrlDto) {
    return this.s3Service.createUploadUrl(createUploadUrlDto);
  }

  @Post('presigned-url')
  getPresignedUrl(@Body() getPresignedUrlDto: GetPresignedUrlDto) {
    return this.s3Service.getPresignedUrl(getPresignedUrlDto.key, getPresignedUrlDto.expiresIn);
  }

  @Delete('file')
  deleteFile(@Body() deleteFileDto: DeleteFileDto) {
    return this.s3Service.deleteFile(deleteFileDto.key);
  }
}
