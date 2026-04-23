import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingEntity } from './entities/rating.entity';
import { CustomersModule } from '../customers/customers.module';
import { ProductVariantsModule } from '../product-variants-SKU/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([RatingEntity]), CustomersModule, ProductVariantsModule],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
