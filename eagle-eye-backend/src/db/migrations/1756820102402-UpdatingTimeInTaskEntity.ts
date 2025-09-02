import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingTimeInTaskEntity1756820102402 implements MigrationInterface {
    name = 'UpdatingTimeInTaskEntity1756820102402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" SET NOT NULL`);
    }

}
