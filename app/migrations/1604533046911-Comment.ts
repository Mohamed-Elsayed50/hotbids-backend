import {MigrationInterface, QueryRunner} from "typeorm";

export class Comment1604533046911 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `comment` (`id` int PRIMARY KEY AUTO_INCREMENT,`car_id` int,`user_id` int,`comment` text,`seller` bool,`likes` int,`inappropriate` int,`reply_to_comment_id` int,`is_bid` bool,`created_at` datetime);");
        await queryRunner.query("ALTER TABLE `comment` ADD CONSTRAINT comment_to_comment FOREIGN KEY (`reply_to_comment_id`) REFERENCES `comment` (`id`) ON DELETE RESTRICT;");
        await queryRunner.query("ALTER TABLE `comment` ADD CONSTRAINT comment_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `comment` ADD CONSTRAINT comment_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `comment` DROP FOREIGN KEY comment_to_comment;");
        await queryRunner.query("ALTER TABLE `comment` DROP FOREIGN KEY comment_to_user;");
        await queryRunner.query("ALTER TABLE `comment` DROP FOREIGN KEY comment_to_car;");
        await queryRunner.query("DROP TABLE `comment`");
    }

}
