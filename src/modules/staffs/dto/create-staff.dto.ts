import { Trim } from '@/decorators/trim.decorator';
import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsOptional()
  @IsString()
  @Trim()
  avatarUrl: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  workLocationID: StaffWorkLocationID;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @Trim()
  @MaxLength(50)
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsUUID('4')
  store: string;

  @IsUUID('4')
  directManager: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roles: string[];

  @IsOptional()
  @IsBoolean()
  isStoreAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
