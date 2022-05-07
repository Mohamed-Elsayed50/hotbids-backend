import { MigrationInterface, QueryRunner } from "typeorm";

export class LocationMigration1607330683221 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `location` ( `id` INT(11) NOT NULL AUTO_INCREMENT, `name` VARCHAR(64) NOT NULL COLLATE 'utf8mb4_unicode_ci', `country_short` VARCHAR(2) NOT NULL COLLATE 'utf8mb4_unicode_ci', `country` VARCHAR(64) NOT NULL COLLATE 'utf8mb4_unicode_ci', `admin_name` VARCHAR(64) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci', `lat` DOUBLE(8,2) NULL DEFAULT NULL, `lng` DOUBLE(8,2) NULL DEFAULT NULL, PRIMARY KEY (`id`) USING BTREE);");
        await queryRunner.query("ALTER TABLE `location` CHANGE COLUMN `id` `id` INT(11) NOT NULL AUTO_INCREMENT FIRST;");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `zip`;");
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `location_id` INT NULL DEFAULT NULL;");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `user_to_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON UPDATE NO ACTION ON DELETE SET NULL;");

        await queryRunner.query("ALTER TABLE `location` DROP COLUMN `name`;");
        await queryRunner.query("ALTER TABLE `location` DROP COLUMN `country_short`;");
        await queryRunner.query("ALTER TABLE `location` DROP COLUMN `admin_name`;");
        await queryRunner.query("ALTER TABLE `location` DROP COLUMN `country`;");
        await queryRunner.query("ALTER TABLE `location` ADD COLUMN `zip_code`;");
        await queryRunner.query("ALTER TABLE `location` ADD COLUMN `city`;");
        await queryRunner.query("ALTER TABLE `location` ADD COLUMN `state`;");

        await queryRunner.query("ALTER TABLE `location` ADD COLUMN `country` varchar(255);");
        await queryRunner.query("UPDATE `location` SET `country` = 'CA' WHERE `zip_code` REGEXP '^[a-zA-Z]';");
        await queryRunner.query("UPDATE `location` SET `country` = 'US' WHERE `zip_code` REGEXP '^[0-9]';");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
