import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatingTheProjectTable1754402477754
  implements MigrationInterface
{
  name = 'CreatingTheProjectTable1754402477754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "startDate" date, "endDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "created_by_user_id" integer NOT NULL, "company_id" integer, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_9b4b555ca01bd035b4879ed4fce" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_c8708288b8e6a060ed7b9e1a226" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_c8708288b8e6a060ed7b9e1a226"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_9b4b555ca01bd035b4879ed4fce"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
