"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleToManyToOne1753388000000 = void 0;
class UpdateUserRoleToManyToOne1753388000000 {
    name = 'UpdateUserRoleToManyToOne1753388000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_roleId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "REL_users_roleId"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_roleId" UNIQUE ("roleId")`);
    }
}
exports.UpdateUserRoleToManyToOne1753388000000 = UpdateUserRoleToManyToOne1753388000000;
//# sourceMappingURL=1753388000000-UpdateUserRoleToManyToOne.js.map