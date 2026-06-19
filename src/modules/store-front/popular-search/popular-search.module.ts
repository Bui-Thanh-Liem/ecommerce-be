import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopularSearchEntity } from './entities/popular-search.entity';
import { PopularSearchController } from './popular-search.controller';
import { PopularSearchService } from './popular-search.service';

/**
 * Mặc định thì dữ liệu sẽ lấy từ dữ liệu người dùng search
 * Tạo thêm module để hỗ trợ MKT (VD: thêm popular search mà không cần phải search)
 */
@Module({
  imports: [TypeOrmModule.forFeature([PopularSearchEntity])],
  controllers: [PopularSearchController],
  providers: [PopularSearchService],
})
export class PopularSearchModule {}
