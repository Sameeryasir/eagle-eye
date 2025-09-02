"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingTheImageTable1756215479220 = void 0;
class UpdatingTheImageTable1756215479220 {
    name = 'UpdatingTheImageTable1756215479220';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_images_log_id"`);
        await queryRunner.query(`ALTER TABLE "images" ADD "fileName" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" ADD "size" numeric(4,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "log_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_aa06a9e66914fd5e3270bfea000" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_aa06a9e66914fd5e3270bfea000"`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "log_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "fileName"`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_images_log_id" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
exports.UpdatingTheImageTable1756215479220 = UpdatingTheImageTable1756215479220;
//# sourceMappingURL=1756215479220-UpdatingTheImageTable.js.map