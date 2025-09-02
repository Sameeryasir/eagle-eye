"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddingEnumAndUpdatingColumnsInTaskTable1755092314509 = void 0;
class AddingEnumAndUpdatingColumnsInTaskTable1755092314509 {
    name = 'AddingEnumAndUpdatingColumnsInTaskTable1755092314509';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium'`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "startTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" SET NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "startTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    }
}
exports.AddingEnumAndUpdatingColumnsInTaskTable1755092314509 = AddingEnumAndUpdatingColumnsInTaskTable1755092314509;
//# sourceMappingURL=1755092314509-AddingEnumAndUpdatingColumnsInTaskTable.js.map