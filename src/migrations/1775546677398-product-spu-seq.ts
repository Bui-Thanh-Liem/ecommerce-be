import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductSpuSeq1775546677398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE product_spu_seq START 1;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE product_spu_seq;`);
  }
}
