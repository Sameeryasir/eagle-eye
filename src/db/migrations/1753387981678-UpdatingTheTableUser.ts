import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingTheTableUser1753387981678 implements MigrationInterface {
    name = 'UpdatingTheTableUser1753387981678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
    }

}
