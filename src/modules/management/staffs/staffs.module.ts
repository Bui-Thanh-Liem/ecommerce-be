import { forwardRef, Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffEntity } from './entities/staff.entity';
import { RolesModule } from '../roles/roles.module';
import { StoresModule } from '@/modules/inventory/stores/stores.module';

@Module({
  imports: [RolesModule, TypeOrmModule.forFeature([StaffEntity]), forwardRef(() => StoresModule)],
  controllers: [StaffsController],
  providers: [StaffsService],
  exports: [StaffsService],
})
export class StaffsModule {}
