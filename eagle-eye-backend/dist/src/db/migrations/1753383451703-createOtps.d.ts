import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateOtps1753383451703 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
