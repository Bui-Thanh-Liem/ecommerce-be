import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderNumberSeq1775546677398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE order_number_seq START 1;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE order_number_seq;`);
  }
}
