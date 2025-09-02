import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateImagesTable1755899299999 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
