import { SerializerDto } from '@/shared/dtos/res/serializer.dto';
import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { TeamType } from '@/shared/enums/team-type.enum';
import { Expose } from 'class-transformer';

export class TeamCategoryDto extends SerializerDto {
  @Expose()
  name: string;

  @Expose()
  code: TeamCategoryCode;

  @Expose()
  type: TeamType;
}
