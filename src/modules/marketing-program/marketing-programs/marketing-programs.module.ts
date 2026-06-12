import { Module } from '@nestjs/common';
import { MarketingProgramsService } from './marketing-programs.service';
import { MarketingProgramsController } from './marketing-programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingProgramEntity } from './entities/marketing-program.entity';
import { CampaignModule } from '../campaigns/campaigns.module';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingProgramEntity]), CampaignModule],
  controllers: [MarketingProgramsController],
  providers: [MarketingProgramsService],
})
export class MarketingProgramsModule {}
