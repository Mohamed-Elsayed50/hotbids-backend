import {MigrationInterface, QueryRunner} from "typeorm";

export class CommentInappropriate1604533073526 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `comment_inappropriate` (`id` int PRIMARY KEY AUTO_INCREMENT,`user_id` int,`comment_id` int);");
        await queryRunner.query("ALTER TABLE `comment_inappropriate` ADD CONSTRAINT comment_inappropriate_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `comment_inappropriate` ADD CONSTRAINT comment_inappropriate_to_comment FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `comment_inappropriate` DROP FOREIGN KEY comment_inappropriate_to_user;");
        await queryRunner.query("ALTER TABLE `comment_inappropriate` DROP FOREIGN KEY comment_inappropriate_to_comment;");
        await queryRunner.query("DROP TABLE `comment_inappropriate`");
    }

}
