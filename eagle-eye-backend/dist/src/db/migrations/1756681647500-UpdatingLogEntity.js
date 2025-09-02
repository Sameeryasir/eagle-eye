"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingLogEntity1756681647500 = void 0;
class UpdatingLogEntity1756681647500 {
    name = 'UpdatingLogEntity1756681647500';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE`);
    }
}
exports.UpdatingLogEntity1756681647500 = UpdatingLogEntity1756681647500;
//# sourceMappingURL=1756681647500-UpdatingLogEntity.js.map