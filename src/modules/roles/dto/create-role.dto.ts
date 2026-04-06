import { Trim } from '@/decorators/trim.decorator';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @MaxLength(100)
  @IsString()
  @Trim()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @Trim()
  @IsNotEmpty()
  desc: string;

  @IsArray() // Mảng chứa các ID của permissions liên quan đến role này
  @ArrayNotEmpty({ message: 'Permissions cannot be empty' }) // Đảm bảo mảng không rỗng
  @IsUUID('4', { each: true }) // Kiểm tra mỗi phần tử trong mảng có phải là UUID v4 hay không
  permissions: string[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
