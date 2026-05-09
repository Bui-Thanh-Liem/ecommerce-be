import { IsNotInArray } from '@/decorators/is-not-in-array.decorator';
import { Trim } from '@/decorators/trim.decorator';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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
  @IsNotInArray('members', { message: "The leader's name should not be on the list of members." })
  leader: string;

  @IsUUID('4', { each: true })
  @IsNotEmpty()
  members: string[];

  @IsOptional()
  @IsUUID()
  store: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
