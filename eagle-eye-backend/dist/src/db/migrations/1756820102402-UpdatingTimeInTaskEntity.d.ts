import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatingTimeInTaskEntity1756820102402 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
