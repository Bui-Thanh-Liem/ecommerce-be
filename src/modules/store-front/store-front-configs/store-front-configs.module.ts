import { Module } from '@nestjs/common';
import { StoreFrontConfigsService } from './store-front-configs.service';
import { StoreFrontConfigsController } from './store-front-configs.controller';
import { TopBannersModule } from '../top-banners/top-banners.module';
import { StoreFrontConfigEntity } from './entities/store-front-config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([StoreFrontConfigEntity]), TopBannersModule, MenuModule],
  controllers: [StoreFrontConfigsController],
  providers: [StoreFrontConfigsService],
})
export class StoreFrontConfigsModule {}
