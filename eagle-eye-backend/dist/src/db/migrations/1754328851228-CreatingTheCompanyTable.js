"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatingTheCompanyTable1754328851228 = void 0;
class CreatingTheCompanyTable1754328851228 {
    name = 'CreatingTheCompanyTable1754328851228';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "companies" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying, "city" character varying, "state" character varying, "country" character varying NOT NULL DEFAULT 'USA', "owner_user_id" integer, CONSTRAINT "REL_a2e26270eefa893caca40d8de4" UNIQUE ("owner_user_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "FK_a2e26270eefa893caca40d8de4e" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_a2e26270eefa893caca40d8de4e"`);
        await queryRunner.query(`DROP TABLE "companies"`);
    }
}
exports.CreatingTheCompanyTable1754328851228 = CreatingTheCompanyTable1754328851228;
//# sourceMappingURL=1754328851228-CreatingTheCompanyTable.js.map