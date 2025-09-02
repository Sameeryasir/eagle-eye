import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdatingPhoneLengthInUser1753797341586 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
