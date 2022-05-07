import { MigrationInterface, QueryRunner } from "typeorm";

export class Car1604532987148 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `car` (`id` int PRIMARY KEY AUTO_INCREMENT,`owner_id` int,`reserve` bool,`title` varchar(255),`subtitle` varchar(255),`end_date` datetime,`history_report` varchar(255),`location` varchar(255),`vin` varchar(255),`mileage` integer,`body_style` varchar(255),`engine` varchar(255),`drivetrain` varchar(255),`transmission` varchar(255),`exterior_color` varchar(255),`interior_color` varchar(255),`title_status` varchar(255),`seller_type` varchar(255),`dougs_take` text,`highlights` text,`equipment` text,`modifications` text,`recent_service_history` text,`other_items_included_in_sale` text,`sellers_ownership_history` text,`seller_notes` text);");
        await queryRunner.query("ALTER TABLE `car` ADD CONSTRAINT car_to_user FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `created_at` datetime;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `location_id` int;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `verified` tinyint;");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN car_to_location FOREIGN KEY (`location_id`) REFERENCES `location` (`id`);");
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `verified_by_id` FOREING KEY (`verified_by_id`) REFERENCES `user` (`id`);");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` DROP FOREIGN KEY car_to_user;");
        await queryRunner.query("ALTER TABLE `car` DROP FOREIGN KEY car_to_location;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `location_id`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `verified`;");
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `created_at`;");
        await queryRunner.query("DROP TABLE `car`");
    }

}
