import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingTheImageTable1756215479220 implements MigrationInterface {
    name = 'UpdatingTheImageTable1756215479220'
 public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the old FK constraint
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_images_log_id"`);

        // Add new columns
        await queryRunner.query(`ALTER TABLE "images" ADD "fileName" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" ADD "size" numeric(4,2) NOT NULL`);

        // Make log_id required
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "log_id" SET NOT NULL`);

        // Add new FK with cascade
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_aa06a9e66914fd5e3270bfea000" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new FK
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_aa06a9e66914fd5e3270bfea000"`);

        // Make log_id nullable again (revert the SET NOT NULL)
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "log_id" DROP NOT NULL`);

        // Drop the new columns
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "fileName"`);

        // Re-add the old FK
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_images_log_id" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
