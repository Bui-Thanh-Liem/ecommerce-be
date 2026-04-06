import { IsArray, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;

  @IsUUID('4')
  store: string;

  @IsArray()
  @IsUUID('4', { each: true })
  roles: string[];
}
