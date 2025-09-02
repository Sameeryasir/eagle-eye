"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoles1753383451704 = void 0;
class CreateRoles1753383451704 {
    name = 'CreateRoles1753383451704';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_roleId"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }
}
exports.CreateRoles1753383451704 = CreateRoles1753383451704;
//# sourceMappingURL=1753383451704-createRoles.js.map