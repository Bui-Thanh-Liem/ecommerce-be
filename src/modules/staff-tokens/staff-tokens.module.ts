import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffTokenEntity } from './entities/staff-token.entity';
import { StaffTokensController } from './staff-tokens.controller';
import { StaffTokensService } from './staff-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaffTokenEntity])],
  controllers: [StaffTokensController],
  providers: [StaffTokensService],
  exports: [StaffTokensService],
})
export class StaffTokensModule {}
