import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
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
    FileInterceptor('large-file', {
      dest: './uploads',
    }),
  )
  uploadLargeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name: string },
  ) {
    try {
      console.log('file:::', file);
      console.log('body:::', body);

      // Get file name
      const fileName = body.name.replace(
        /^(.*?\.[a-zA-Z0-9]+)(?:-\d+)?$/,
        '$1',
      );
      const nameDir = `./uploads/${fileName}`;

      // mkdir
      if (!fs.existsSync(nameDir)) {
        fs.mkdirSync(nameDir);
      }

      // Move file to folder
      fs.cpSync(file.path, `${nameDir}/${body.name}`);

      // remove temp file
      fs.rmSync(file.path);

      return fileName;
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }

  @Get('merge-file')
  mergeFile(@Query('file') fileName: string) {
    const nameDir = `./uploads/${fileName}`;

    // Read all files in the directory
    const files = fs.readdirSync(nameDir);

    //
    let startPos = 0;
    let count = 0;
    files.map((file) => {
      const filePath = `${nameDir}/${file}`;
      const streamFile = fs.createReadStream(filePath);
      streamFile
        .pipe(
          fs.createWriteStream(`uploads/output/${fileName}`, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          count++;
          if (count === files.length) {
            console.log(`Merged file completed: ${fileName}`);
            fs.rm(
              nameDir,
              {
                recursive: true,
              },
              () => {
                console.log(`Removed temp folder: ${nameDir}`);
              },
            );
          }
        });

      startPos += fs.statSync(filePath).size;
    });
  }
}
