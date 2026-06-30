import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { DocumentEntity } from './entity/document.entity';
import { QueryRouterService } from './query-router.service';
import { HybridSearchService } from './hybrid-search.service';
import { RbacService } from './rbac.service';
import { ReRankerService } from './reranker.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  controllers: [RagController],
  providers: [RagService, QueryRouterService, HybridSearchService, RbacService, ReRankerService],
})
export class RagModule {}
