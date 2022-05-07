import {MigrationInterface, QueryRunner} from "typeorm";

export class CarVideo1604533018400 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `car_video` (`id` int PRIMARY KEY AUTO_INCREMENT,`car_id` int,`url` varchar(255));");
        await queryRunner.query("ALTER TABLE `car_video` ADD CONSTRAINT car_video_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car_video` DROP FOREIGN KEY car_video_to_car;");
        await queryRunner.query("DROP TABLE `car_video`");
    }

}
