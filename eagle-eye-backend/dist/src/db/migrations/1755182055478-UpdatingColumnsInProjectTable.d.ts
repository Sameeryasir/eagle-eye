import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatingColumnsInProjectTable1755182055478 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
