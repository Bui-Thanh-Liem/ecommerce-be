import { Module } from '@nestjs/common';
import { MoMoService } from './momo.service';
import { MoMoController } from './momo.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MoMoController],
  providers: [MoMoService],
})
export class MoMoModule {}
