import {MigrationInterface, QueryRunner} from "typeorm";

export class Bid1604533039497 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `bid` (`id` int PRIMARY KEY AUTO_INCREMENT,`car_id` int,`user_id` int,`bid` int,`created_at` datetime);");
        await queryRunner.query("ALTER TABLE `bid` ADD CONSTRAINT bid_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `bid` ADD CONSTRAINT bid_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `bid` DROP FOREIGN KEY bid_to_user;");
        await queryRunner.query("ALTER TABLE `bid` DROP FOREIGN KEY bid_to_car;");
        await queryRunner.query("DROP TABLE `bid`");
    }

}
