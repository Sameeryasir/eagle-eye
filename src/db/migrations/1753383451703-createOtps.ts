import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOtps1753383451703 implements MigrationInterface {
    name = 'CreateOtps1753383451703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "otps" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_otps_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "FK_otps_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_otps_user_id"`);
        await queryRunner.query(`DROP TABLE "otps"`);
    }

} 