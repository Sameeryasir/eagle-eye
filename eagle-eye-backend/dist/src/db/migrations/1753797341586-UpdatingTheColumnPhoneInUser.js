"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatingPhoneLengthInUser1753797341586 = void 0;
class UpdatingPhoneLengthInUser1753797341586 {
    name = 'UpdatingPhoneLengthInUser1753797341586';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" TYPE character varying(15)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" TYPE character varying(11)`);
    }
}
exports.UpdatingPhoneLengthInUser1753797341586 = UpdatingPhoneLengthInUser1753797341586;
//# sourceMappingURL=1753797341586-UpdatingTheColumnPhoneInUser.js.map