import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdatingUserTable1754330912485 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
