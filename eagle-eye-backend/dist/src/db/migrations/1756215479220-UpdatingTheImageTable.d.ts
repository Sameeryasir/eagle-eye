import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatingTheImageTable1756215479220 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
