import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffTokenEntity } from './entities/staff-token.entity';
import { StaffTokensService } from './staff-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaffTokenEntity])],
  controllers: [],
  providers: [StaffTokensService],
  exports: [StaffTokensService],
})
export class StaffTokensModule {}
