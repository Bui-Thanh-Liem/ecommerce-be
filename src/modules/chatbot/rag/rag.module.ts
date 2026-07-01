import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { QueryRouterService } from './query-router.service';
import { HybridSearchService } from './hybrid-search.service';
import { RbacService } from './rbac.service';
import { ReRankerService } from './reranker.service';
import { DocumentModule } from '../document/document.module';
import { ProductVariantsModule } from '@/modules/catalog/product-variants-SKU/product-variants.module';

@Module({
  imports: [DocumentModule, ProductVariantsModule],
  controllers: [RagController],
  providers: [RagService, QueryRouterService, HybridSearchService, RbacService, ReRankerService],
  exports: [RagService, QueryRouterService, HybridSearchService, RbacService, ReRankerService],
})
export class RagModule {}
