import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatingTaskTable1754602010790 implements MigrationInterface {
  name = 'UpdatingTaskTable1754602010790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert without dropping data
    await queryRunner.query(`
      ALTER TABLE "tasks"
        ALTER COLUMN "startTime" TYPE TIMESTAMPTZ USING "startTime" AT TIME ZONE 'UTC',
        ALTER COLUMN "endTime"   TYPE TIMESTAMPTZ USING "endTime"   AT TIME ZONE 'UTC'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to timestamp (without time zone)
    await queryRunner.query(`
      ALTER TABLE "tasks"
        ALTER COLUMN "startTime" TYPE TIMESTAMP WITHOUT TIME ZONE,
        ALTER COLUMN "endTime"   TYPE TIMESTAMP WITHOUT TIME ZONE
    `);
  }
}
