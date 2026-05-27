import { NotFoundException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_PROVIDER = 'CLOUDINARY_PROVIDER';
export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const config = configService.get<typeof cloudinary>('cloudinary');
    if (!config) {
      throw new NotFoundException('Cloudinary configuration is missing');
    }

    return config;
  },
};
