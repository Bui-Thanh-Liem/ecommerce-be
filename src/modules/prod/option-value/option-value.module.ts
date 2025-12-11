import { Module } from '@nestjs/common';
import { OptionValueService } from './option-value.service';
import { OptionValueController } from './option-value.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionValue } from './entities/option-value.entity';
import { OptionService } from '../option/option.service';
import { Option } from '../option/entities/option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OptionValue, Option])],
  controllers: [OptionValueController],
  providers: [OptionValueService, OptionService],
})
export class OptionValueModule {}
