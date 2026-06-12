import { PartialType } from '@nestjs/swagger';
import { CreateMarketingProgramDto } from './create-mkt-program.dto';

export class UpdateMarketingProgramDto extends PartialType(CreateMarketingProgramDto) {}
