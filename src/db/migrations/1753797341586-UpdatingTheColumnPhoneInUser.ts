import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingPhoneLengthInUser1753797341586 implements MigrationInterface {
  name = 'UpdatingPhoneLengthInUser1753797341586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" TYPE character varying(15)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" TYPE character varying(11)`);
  }
}
