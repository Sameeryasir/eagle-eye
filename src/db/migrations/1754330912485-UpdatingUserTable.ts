import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingUserTable1754330912485 implements MigrationInterface {
    name = 'UpdatingUserTable1754330912485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "dob" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_by_user_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "company_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_3402191df44bc05c18c1cbbdc92" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_3402191df44bc05c18c1cbbdc92"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "company_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dob"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "title"`);
    }

}
