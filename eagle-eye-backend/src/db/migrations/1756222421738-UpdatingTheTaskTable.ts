import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingTheTaskTable1756222421738 implements MigrationInterface {
    name = 'UpdatingTheTaskTable1756222421738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_logs_task_id"`);
        await queryRunner.query(`ALTER TABLE "logs" DROP COLUMN "task_id"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "log_id" integer`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_70c2c3d40d9f661ac502de51349" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_ce7b179d30968837f1aba6bb472" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_ce7b179d30968837f1aba6bb472"`);
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_70c2c3d40d9f661ac502de51349"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "log_id"`);
        await queryRunner.query(`ALTER TABLE "logs" ADD "task_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_logs_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
