import { Trim } from '@/decorators/trim.decorator';
import { TeamStatus } from '@/shared/enums/team-status.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @Trim()
  desc: string;

  @IsUUID()
  @IsNotEmpty()
  leader: string;

  @IsUUID('4', { each: true })
  @IsNotEmpty()
  members: string[];

  @IsUUID()
  @IsNotEmpty()
  store: string;

  @IsOptional()
  @IsEnum(TeamStatus)
  status: TeamStatus;
}
