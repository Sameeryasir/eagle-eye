import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleToManyToOne1753388000000 implements MigrationInterface {
    name = 'UpdateUserRoleToManyToOne1753388000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_roleId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "REL_users_roleId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_roleId" UNIQUE ("roleId")`);
    }
} 