import { StaffDto } from '@/modules/management/staffs/dto/staff.dto';
import { Logger } from '@nestjs/common';
import { Exclude, Expose } from 'class-transformer';

export class SerializerDto {
  @Exclude()
  logger: Logger;

  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy: StaffDto;

  @Expose()
  updatedBy: StaffDto;
}
