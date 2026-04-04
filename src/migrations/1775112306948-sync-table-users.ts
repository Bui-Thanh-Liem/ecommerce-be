import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncTableUsers1775112306948 implements MigrationInterface {
  name = 'SyncTableUsers1775112306948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "admin" boolean NOT NULL DEFAULT (0))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_users"("id", "email", "password", "admin") SELECT "id", "email", "password", "admin" FROM "users"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "admin" boolean NOT NULL DEFAULT (0), "admin_" boolean NOT NULL DEFAULT (0))`,
    );
    await queryRunner.query(
      `INSERT INTO "users"("id", "email", "password", "admin") SELECT "id", "email", "password", "admin" FROM "temporary_users"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_users"`);
  }
}
