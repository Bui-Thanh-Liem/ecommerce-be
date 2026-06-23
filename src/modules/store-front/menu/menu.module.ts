import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { CategoriesModule } from '@/modules/catalog/categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity]), CategoriesModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
