import {MigrationInterface, QueryRunner} from "typeorm";

export class CarWatched1604533032083 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `car_watched` (`id` int PRIMARY KEY AUTO_INCREMENT,`car_id` int,`user_id` int,`created_at` datetime);");
        await queryRunner.query("ALTER TABLE `car_watched` ADD CONSTRAINT car_watched_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `car_watched` ADD CONSTRAINT car_watched_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car_watched` DROP FOREIGN KEY car_watched_to_user;");
        await queryRunner.query("ALTER TABLE `car_watched` DROP FOREIGN KEY car_watched_to_car;");
        await queryRunner.query("DROP TABLE `car_watched`");
    }

}
