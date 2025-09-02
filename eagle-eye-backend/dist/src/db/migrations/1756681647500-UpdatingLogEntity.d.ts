import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatingLogEntity1756681647500 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
