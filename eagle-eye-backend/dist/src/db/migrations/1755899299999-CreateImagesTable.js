"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateImagesTable1755899299999 = void 0;
class CreateImagesTable1755899299999 {
    name = 'CreateImagesTable1755899299999';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "imageUrl" character varying(500) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "log_id" integer NOT NULL, CONSTRAINT "PK_images_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_images_log_id" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_images_log_id"`);
        await queryRunner.query(`DROP TABLE "images"`);
    }
}
exports.CreateImagesTable1755899299999 = CreateImagesTable1755899299999;
//# sourceMappingURL=1755899299999-CreateImagesTable.js.map