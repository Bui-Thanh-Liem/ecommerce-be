import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { DocumentEntity } from './document.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
