import { PartialType } from '@nestjs/swagger';
import { CreatePopularSearchDto } from './create-popular-search.dto';

export class UpdatePopularSearchDto extends PartialType(CreatePopularSearchDto) {}
