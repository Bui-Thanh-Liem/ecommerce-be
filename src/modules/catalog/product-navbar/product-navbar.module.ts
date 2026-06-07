import { Module } from '@nestjs/common';
import { ProductNavbarService } from './product-navbar.service';
import { ProductNavbarController } from './product-navbar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductNavbarEntity } from './entities/product-navbar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductNavbarEntity])],
  controllers: [ProductNavbarController],
  providers: [ProductNavbarService],
})
export class ProductNavbarModule {}
