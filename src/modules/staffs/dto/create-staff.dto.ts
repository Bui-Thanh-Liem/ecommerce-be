import { Trim } from '@/decorators/trim.decorator';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string;

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

  @IsUUID('4')
  store: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  roles: string[];
}
