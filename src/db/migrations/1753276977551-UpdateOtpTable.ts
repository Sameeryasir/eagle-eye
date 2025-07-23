import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOtpTable1753276977551 implements MigrationInterface {
    name = 'UpdateOtpTable1753276977551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "otp" ADD CONSTRAINT "UQ_db724db1bc3d94ad5ba38518433" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "otp" ADD CONSTRAINT "FK_db724db1bc3d94ad5ba38518433" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP CONSTRAINT "FK_db724db1bc3d94ad5ba38518433"`);
        await queryRunner.query(`ALTER TABLE "otp" DROP CONSTRAINT "UQ_db724db1bc3d94ad5ba38518433"`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "userId"`);
    }

}
