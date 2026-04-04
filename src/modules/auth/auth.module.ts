import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { StaffsModule } from '../staffs/staffs.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [StaffsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
