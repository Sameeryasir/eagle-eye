import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdatingTaskTable1754602010790 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
