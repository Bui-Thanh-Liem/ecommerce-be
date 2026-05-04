import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyGroup: string;

  @IsOptional()
  @IsString()
  desc: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
