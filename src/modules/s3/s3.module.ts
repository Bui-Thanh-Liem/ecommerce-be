import { Module, NotFoundException } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT } from '@/shared/constants/s3.constant';

@Module({
  controllers: [S3Controller],
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const s3ClientConfig = configService.get<S3Client>('s3-client');
        if (!s3ClientConfig) {
          throw new NotFoundException('S3 Client configuration is missing');
        }

        return s3ClientConfig;
      },
    },
    S3Service,
  ],
  exports: [S3Service, S3_CLIENT],
})
export class S3Module {}
