import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SigninStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}
