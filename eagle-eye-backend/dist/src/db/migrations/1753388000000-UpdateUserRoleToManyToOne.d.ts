import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdateUserRoleToManyToOne1753388000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
