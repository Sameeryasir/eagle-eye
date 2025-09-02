import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddingEnumAndUpdatingColumnsInTaskTable1755092314509 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
