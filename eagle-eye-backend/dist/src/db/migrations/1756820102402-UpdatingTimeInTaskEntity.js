"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingTimeInTaskEntity1756820102402 = void 0;
class UpdatingTimeInTaskEntity1756820102402 {
    name = 'UpdatingTimeInTaskEntity1756820102402';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "endTime" SET NOT NULL`);
    }
}
exports.UpdatingTimeInTaskEntity1756820102402 = UpdatingTimeInTaskEntity1756820102402;
//# sourceMappingURL=1756820102402-UpdatingTimeInTaskEntity.js.map