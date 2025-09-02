"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOtps1753383451703 = void 0;
class CreateOtps1753383451703 {
    name = 'CreateOtps1753383451703';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "otps" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_otps_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "FK_otps_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_otps_user_id"`);
        await queryRunner.query(`DROP TABLE "otps"`);
    }
}
exports.CreateOtps1753383451703 = CreateOtps1753383451703;
//# sourceMappingURL=1753383451703-createOtps.js.map