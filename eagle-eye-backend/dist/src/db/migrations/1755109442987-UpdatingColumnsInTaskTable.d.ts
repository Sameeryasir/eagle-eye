import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatingColumnsInTaskTable1755109442987 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
