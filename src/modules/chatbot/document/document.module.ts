import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentInternalEntity } from './entity/document-internal.entity';
import { DocumentPublicEntity } from './entity/document-public.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentInternalEntity, DocumentPublicEntity])],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
