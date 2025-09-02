"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeTaskEndTimeNullable1756682000000 = void 0;
class MakeTaskEndTimeNullable1756682000000 {
    name = 'MakeTaskEndTimeNullable1756682000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" SET NOT NULL`);
    }
}
exports.MakeTaskEndTimeNullable1756682000000 = MakeTaskEndTimeNullable1756682000000;
//# sourceMappingURL=1756682000000-MakeTaskEndTimeNullable.js.map