import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  desc: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
