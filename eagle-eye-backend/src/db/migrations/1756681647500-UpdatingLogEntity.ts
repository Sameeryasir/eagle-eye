import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingLogEntity1756681647500 implements MigrationInterface {
    name = 'UpdatingLogEntity1756681647500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Only alter logs.createdAt to timestamptz
        await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE`);
    }

}
