import {MigrationInterface, QueryRunner} from "typeorm";

export class QuestionInappropriate1604533148109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `question_inappropriate` (`id` int PRIMARY KEY AUTO_INCREMENT,`user_id` int,`question_id` int);");
        await queryRunner.query("ALTER TABLE `question_inappropriate` ADD CONSTRAINT question_inappropriate_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `question_inappropriate` ADD CONSTRAINT question_inappropriate_to_question FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question_inappropriate` DROP FOREIGN KEY question_inappropriate_to_user;");
        await queryRunner.query("ALTER TABLE `question_inappropriate` DROP FOREIGN KEY question_inappropriate_to_question;");
        await queryRunner.query("DROP TABLE `question_inappropriate`");
    }

}
