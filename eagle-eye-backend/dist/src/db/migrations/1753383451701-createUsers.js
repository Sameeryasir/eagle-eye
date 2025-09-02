"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsers1753383451701 = void 0;
class CreateUsers1753383451701 {
    name = 'CreateUsers1753383451701';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying UNIQUE,
        "first_name" character varying,
        "last_name" character varying,
        "phone" character varying(11) UNIQUE,
        "roleId" integer,
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
exports.CreateUsers1753383451701 = CreateUsers1753383451701;
//# sourceMappingURL=1753383451701-createUsers.js.map