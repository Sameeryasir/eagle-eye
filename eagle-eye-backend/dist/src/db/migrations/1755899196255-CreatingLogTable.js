"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatingLogTable1755899196255 = void 0;
class CreatingLogTable1755899196255 {
    name = 'CreatingLogTable1755899196255';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "logs" ("id" SERIAL NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "task_id" integer NOT NULL, CONSTRAINT "PK_logs_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_logs_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_logs_task_id"`);
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_logs_user_id"`);
        await queryRunner.query(`DROP TABLE "logs"`);
    }
}
exports.CreatingLogTable1755899196255 = CreatingLogTable1755899196255;
//# sourceMappingURL=1755899196255-CreatingLogTable.js.map