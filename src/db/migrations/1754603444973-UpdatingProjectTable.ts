import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectsDatesToTimestamptz1754603444973 implements MigrationInterface {
  name = 'ProjectsDatesToTimestamptz1754603444973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "projects"
        ALTER COLUMN "startDate" TYPE TIMESTAMPTZ USING "startDate" AT TIME ZONE 'UTC',
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "projects"
        ALTER COLUMN "startDate" TYPE DATE,
    `);
  }
}
