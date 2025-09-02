import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatingTheTaskTable1756222421738 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
