import { Module } from '@nestjs/common';
import { StoreFrontConfigsService } from './store-front-configs.service';
import { StoreFrontConfigsController } from './store-front-configs.controller';
import { StoreFrontConfigEntity } from './entities/store-front-config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StoreFrontConfigEntity])],
  controllers: [StoreFrontConfigsController],
  providers: [StoreFrontConfigsService],
})
export class StoreFrontConfigsModule {}
