import { Trim } from '@/decorators/trim.decorator';
import { MAX_ROLES_IN_STAFF } from '@/shared/constants/staff.constant';
import { ImageDto } from '@/shared/dtos/req/image.dto';
import { StaffWorkLocationID } from '@/shared/enums/staff-work-location-id.enum';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStaffDto {
  @IsOptional()
  @IsObject()
  avatar?: ImageDto;

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
  @IsUUID('4')
  managedStore?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_ROLES_IN_STAFF, { message: `A staff can have at most ${MAX_ROLES_IN_STAFF} roles.` })
  @IsUUID('4', { each: true })
  roles: string[];

  @IsOptional()
  @IsBoolean()
  isStoreAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isSubAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
