import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExpoTable1757516239018 implements MigrationInterface {
    name = 'CreateExpoTable1757516239018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."expo_tokens_platform_enum" AS ENUM('ios', 'android', 'web')`);
        await queryRunner.query(`CREATE TABLE "expo_tokens" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "expoPushToken" text NOT NULL, "platform" "public"."expo_tokens_platform_enum" NOT NULL DEFAULT 'ios', "deviceType" character varying NOT NULL DEFAULT 'mobile', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd2970add79c11b5fd686983ab5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "expo_tokens" ADD CONSTRAINT "FK_b1ddf74bdc397ab1e27385dcdd0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expo_tokens" DROP CONSTRAINT "FK_b1ddf74bdc397ab1e27385dcdd0"`);
        await queryRunner.query(`DROP TABLE "expo_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."expo_tokens_platform_enum"`);
    }

}
