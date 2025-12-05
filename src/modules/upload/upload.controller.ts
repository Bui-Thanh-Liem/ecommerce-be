import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';

@Controller('upload')
export class UploadController {
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
      storage: storage,
      limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
      fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException(
              'Only image files are allowed! (jpg, jpeg, png, gif, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadFiles(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log('file path:::', file.path);
      return file.path;
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }

  @Post('large-file')
  @UseInterceptors(
    FilesInterceptor('large-file', 20, {
      dest: './uploads',
    }),
  )
  uploadLargeFile(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      console.log('files:::', files);
      return files;
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }
}
