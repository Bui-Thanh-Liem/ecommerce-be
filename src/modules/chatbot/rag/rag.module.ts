import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { QueryRouterService } from './query-router.service';
import { HybridSearchService } from './hybrid-search.service';
import { RbacService } from './rbac.service';
import { ReRankerService } from './reranker.service';
import { DocumentModule } from '../document/document.module';
import { ProductVariantsModule } from '@/modules/catalog/product-variants-SKU/product-variants.module';
import { ChatHistoryModule } from '../chat-history/chat-history.module';
import { PromptService } from './prompt.service';

@Module({
  imports: [DocumentModule, ProductVariantsModule, ChatHistoryModule],
  controllers: [RagController],
  providers: [RagService, QueryRouterService, HybridSearchService, RbacService, ReRankerService, PromptService],
  exports: [RagService, QueryRouterService, HybridSearchService, RbacService, ReRankerService, PromptService],
})
export class RagModule {}
