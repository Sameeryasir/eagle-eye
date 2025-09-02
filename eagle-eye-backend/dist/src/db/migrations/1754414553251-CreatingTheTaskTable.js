"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatingTheTaskTable1754414553251 = void 0;
class CreatingTheTaskTable1754414553251 {
    name = 'CreatingTheTaskTable1754414553251';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "tasks" (
            "id" SERIAL NOT NULL, 
            "title" character varying(255) NOT NULL, 
            "description" text, 
            "startTime" TIMESTAMP, 
            "endTime" TIMESTAMP, 
            "project_id" integer, 
            "user_id" integer, 
            CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_db55af84c226af9dce09487b61b"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
    }
}
exports.CreatingTheTaskTable1754414553251 = CreatingTheTaskTable1754414553251;
//# sourceMappingURL=1754414553251-CreatingTheTaskTable.js.map