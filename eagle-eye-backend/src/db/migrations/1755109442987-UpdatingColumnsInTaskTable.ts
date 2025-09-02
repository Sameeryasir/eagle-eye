import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingColumnsInTaskTable1755109442987 implements MigrationInterface {
    name = 'UpdatingColumnsInTaskTable1755109442987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TYPE "public"."tasks_priority_enum" RENAME TO "tasks_priority_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE "public"."tasks_priority_enum" USING "priority"::"text"::"public"."tasks_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium'`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum_old" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE "public"."tasks_priority_enum_old" USING "priority"::"text"::"public"."tasks_priority_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium'`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tasks_priority_enum_old" RENAME TO "tasks_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "createdAt"`);
    }

}
