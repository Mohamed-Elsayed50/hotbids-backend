import {MigrationInterface, QueryRunner} from "typeorm";

export class CarAddDealerShipFields1617534933053 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `dealership_name` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `dealership_website` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `additional_fees` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `additional_fees` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `title_country` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `title_province` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `title_state` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `seller_name` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `seller_phone` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `title_owner` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `owner_has_title` tinyint;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `status` int;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `year` varchar(255);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `start_date` datetime;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `updated_at` datetime;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `dealership_name`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `dealership_website`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `additional_fees`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `additional_fees`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `title_country`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `title_province`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `seller_name`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `seller_phone`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `title_owner`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `title_state`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `owner_has_title`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `status`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `year`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `start_date`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `updated_at`");
    }

}
