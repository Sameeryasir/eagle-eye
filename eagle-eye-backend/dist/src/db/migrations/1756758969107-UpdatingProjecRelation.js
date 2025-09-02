"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingProjecRelation1756758969107 = void 0;
class UpdatingProjecRelation1756758969107 {
    name = 'UpdatingProjecRelation1756758969107';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "UQ_691f1cf2ab1c2e43ec6ca053450"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_691f1cf2ab1c2e43ec6ca053450" UNIQUE ("assigned_to_user_id")`);
    }
}
exports.UpdatingProjecRelation1756758969107 = UpdatingProjecRelation1756758969107;
//# sourceMappingURL=1756758969107-UpdatingProjecRelation.js.map