"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingColumnsInTaskTable1755109442987 = void 0;
class UpdatingColumnsInTaskTable1755109442987 {
    name = 'UpdatingColumnsInTaskTable1755109442987';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TYPE "public"."tasks_priority_enum" RENAME TO "tasks_priority_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE "public"."tasks_priority_enum" USING "priority"::"text"::"public"."tasks_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium'`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum_old" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE "public"."tasks_priority_enum_old" USING "priority"::"text"::"public"."tasks_priority_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium'`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tasks_priority_enum_old" RENAME TO "tasks_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "createdAt"`);
    }
}
exports.UpdatingColumnsInTaskTable1755109442987 = UpdatingColumnsInTaskTable1755109442987;
//# sourceMappingURL=1755109442987-UpdatingColumnsInTaskTable.js.map