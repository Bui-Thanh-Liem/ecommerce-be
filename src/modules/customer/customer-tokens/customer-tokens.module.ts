import { Module } from '@nestjs/common';
import { CustomerTokensService } from './customer-tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerTokenEntity } from './entities/customer-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerTokenEntity])],
  controllers: [],
  providers: [CustomerTokensService],
  exports: [CustomerTokensService],
})
export class CustomerTokensModule {}
