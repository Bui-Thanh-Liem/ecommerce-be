import { Trim } from '@/decorators/trim.decorator';
import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { TeamType } from '@/shared/enums/team-type.enum';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeamCategoryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsEnum(TeamType)
  type: TeamType;

  @IsNotEmpty()
  @IsEnum(TeamCategoryCode)
  code: TeamCategoryCode;
}
