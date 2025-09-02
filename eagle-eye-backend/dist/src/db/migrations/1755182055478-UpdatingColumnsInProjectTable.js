"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingColumnsInProjectTable1755182055478 = void 0;
class UpdatingColumnsInProjectTable1755182055478 {
    name = 'UpdatingColumnsInProjectTable1755182055478';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "projects" ADD "assigned_to_user_id" integer`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_691f1cf2ab1c2e43ec6ca053450" UNIQUE ("assigned_to_user_id")`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_691f1cf2ab1c2e43ec6ca053450" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_691f1cf2ab1c2e43ec6ca053450"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "UQ_691f1cf2ab1c2e43ec6ca053450"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "assigned_to_user_id"`);
    }
}
exports.UpdatingColumnsInProjectTable1755182055478 = UpdatingColumnsInProjectTable1755182055478;
//# sourceMappingURL=1755182055478-UpdatingColumnsInProjectTable.js.map