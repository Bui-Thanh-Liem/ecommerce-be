import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductVariantEmbeddingIdx1782549144710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS product_variant_embedding_idx 
        ON product_variant_embeds 
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS product_variant_embedding_idx;
    `);
  }
}
