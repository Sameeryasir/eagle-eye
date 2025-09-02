"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingTaskTable1754602010790 = void 0;
class UpdatingTaskTable1754602010790 {
    name = 'UpdatingTaskTable1754602010790';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "tasks"
        ALTER COLUMN "startTime" TYPE TIMESTAMPTZ USING "startTime" AT TIME ZONE 'UTC',
        ALTER COLUMN "endTime"   TYPE TIMESTAMPTZ USING "endTime"   AT TIME ZONE 'UTC'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "tasks"
        ALTER COLUMN "startTime" TYPE TIMESTAMP WITHOUT TIME ZONE,
        ALTER COLUMN "endTime"   TYPE TIMESTAMP WITHOUT TIME ZONE
    `);
    }
}
exports.UpdatingTaskTable1754602010790 = UpdatingTaskTable1754602010790;
//# sourceMappingURL=1754602010790-UpdatingTaskTable.js.map