import { MigrationInterface, QueryRunner } from "typeorm";

export class CarFormExtending1614755984069 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `reserve_value` int;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `verification_state` tinyint;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `start_date` datetime;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `start_after` varchar(50);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `make` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `model` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `verification_description` text;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `model`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `make`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `start_after`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `start_date`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `reserve_value`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `verification_state`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `verification_description`;");
    }

}
