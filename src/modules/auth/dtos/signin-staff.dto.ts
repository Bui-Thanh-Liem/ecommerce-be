import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SigninStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @ApiProperty({ default: '0123456789' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ default: 'admin123@' })
  password: string;
}
