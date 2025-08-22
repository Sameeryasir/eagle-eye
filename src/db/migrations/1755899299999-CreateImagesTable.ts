import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateImagesTable1755899299999 implements MigrationInterface {
    name = 'CreateImagesTable1755899299999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "imageUrl" character varying(500) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "log_id" integer NOT NULL, CONSTRAINT "PK_images_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_images_log_id" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_images_log_id"`);
        await queryRunner.query(`DROP TABLE "images"`);
    }
}
