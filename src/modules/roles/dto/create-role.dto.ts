import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @MaxLength(100)
  @IsString()
  name: string;

  @MaxLength(200)
  @IsString()
  desc: string;

  @IsArray() // Mảng chứa các ID của permissions liên quan đến role này
  @ArrayNotEmpty({ message: 'Permissions cannot be empty' }) // Đảm bảo mảng không rỗng
  @IsUUID('4', { each: true }) // Kiểm tra mỗi phần tử trong mảng có phải là UUID v4 hay không
  permissions: string[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
