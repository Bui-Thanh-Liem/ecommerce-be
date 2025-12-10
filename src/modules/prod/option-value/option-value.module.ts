import { Module } from '@nestjs/common';
import { OptionValueService } from './option-value.service';
import { OptionValueController } from './option-value.controller';

@Module({
  controllers: [OptionValueController],
  providers: [OptionValueService],
})
export class OptionValueModule {}
