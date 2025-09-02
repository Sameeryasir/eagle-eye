import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeTaskEndTimeNullable1756682000000 implements MigrationInterface {
    name = 'MakeTaskEndTimeNullable1756682000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" SET NOT NULL`);
    }
}


