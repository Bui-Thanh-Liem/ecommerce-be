import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { StaffTokensModule } from '../management/staff-tokens/staff-tokens.module';
import { StaffsModule } from '../management/staffs/staffs.module';

@Module({
  imports: [StaffsModule, StaffTokensModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
