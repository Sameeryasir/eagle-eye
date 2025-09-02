import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreatingLogTable1755899196255 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
