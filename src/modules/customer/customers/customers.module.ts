import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerTokensModule } from '../customer-tokens/customer-tokens.module';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity]), CustomerTokensModule],
  controllers: [CustomersController],
  providers: [CustomersService, LocalStrategy],
  exports: [CustomersService],
})
export class CustomersModule {}
