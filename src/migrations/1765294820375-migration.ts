import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765294820375 implements MigrationInterface {
    name = 'Migration1765294820375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phone\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_8e1f623798118e629b46a9e629\` (\`phone\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_8e1f623798118e629b46a9e629\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phone\` int NOT NULL`);
    }

}
