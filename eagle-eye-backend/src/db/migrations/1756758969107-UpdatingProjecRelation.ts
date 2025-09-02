import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingProjecRelation1756758969107 implements MigrationInterface {
    name = 'UpdatingProjecRelation1756758969107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Convert one-to-one to many-to-one by removing UNIQUE on assigned_to_user_id
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "UQ_691f1cf2ab1c2e43ec6ca053450"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reinstate the UNIQUE constraint to revert to one-to-one if needed
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_691f1cf2ab1c2e43ec6ca053450" UNIQUE ("assigned_to_user_id")`);
    }

}
