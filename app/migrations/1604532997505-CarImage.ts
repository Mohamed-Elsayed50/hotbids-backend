import {MigrationInterface, QueryRunner} from "typeorm";

export class CarImage1604532997505 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `car_image` (`id` int PRIMARY KEY AUTO_INCREMENT,`car_id` int,`url` varchar(255),`path` varchar(255),`type` tinyint);");
        await queryRunner.query("ALTER TABLE `car_image` ADD CONSTRAINT car_image_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car_image` DROP FOREIGN KEY car_image_to_car;");
        await queryRunner.query("DROP TABLE `car_image`");
    }

}
