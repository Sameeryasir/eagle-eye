import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatingLogTable1755899196255 implements MigrationInterface {
    name = 'CreatingLogTable1755899196255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "logs" ("id" SERIAL NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "task_id" integer NOT NULL, CONSTRAINT "PK_logs_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_logs_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_logs_task_id"`);
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_logs_user_id"`);
        await queryRunner.query(`DROP TABLE "logs"`);
    }
}
