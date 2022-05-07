import {MigrationInterface, QueryRunner} from "typeorm";

export class Question1604533118924 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `question` (`id` int PRIMARY KEY AUTO_INCREMENT,`car_id` int,`user_id` int,`question` text,`answer` text,`likes` int,`inappropriate` int,`created_at` datetime);");
        await queryRunner.query("ALTER TABLE `question` ADD CONSTRAINT question_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `question` ADD CONSTRAINT question_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question` DROP FOREIGN KEY question_to_user;");
        await queryRunner.query("ALTER TABLE `question` DROP FOREIGN KEY question_to_car;");
        await queryRunner.query("DROP TABLE `question`");
    }

}
