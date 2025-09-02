"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsDatesToTimestamptz1754603444973 = void 0;
class ProjectsDatesToTimestamptz1754603444973 {
    name = 'ProjectsDatesToTimestamptz1754603444973';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "projects"
        ALTER COLUMN "startDate" TYPE TIMESTAMPTZ USING "startDate" AT TIME ZONE 'UTC'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "projects"
        ALTER COLUMN "startDate" TYPE DATE
    `);
    }
}
exports.ProjectsDatesToTimestamptz1754603444973 = ProjectsDatesToTimestamptz1754603444973;
//# sourceMappingURL=1754603444973-UpdatingProjectTable.js.map