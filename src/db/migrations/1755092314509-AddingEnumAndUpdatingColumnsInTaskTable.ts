import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingEnumAndUpdatingColumnsInTaskTable1755092314509 implements MigrationInterface {
    name = 'AddingEnumAndUpdatingColumnsInTaskTable1755092314509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium'`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "startTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "startTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    }

}
