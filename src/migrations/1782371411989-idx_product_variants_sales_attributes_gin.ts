import { MigrationInterface, QueryRunner } from 'typeorm';

export class IdxProductVariantsSalesAttributesGin1782371411989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_product_variants_sales_attributes_index_gin
      ON product_variants
      USING GIN (sales_attributes_index jsonb_path_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_product_variants_sales_attributes_index_gin;
    `);
  }
}
