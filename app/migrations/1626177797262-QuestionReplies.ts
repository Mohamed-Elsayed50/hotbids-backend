import { MigrationInterface, QueryRunner } from "typeorm";

export class QuestionReplies1626177797262 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question` ADD CONSTRAINT question_to_question FOREIGN KEY (`reply_to_question_id`) REFERENCES `question` (`id`) ON DELETE RESTRICT;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question` DROP FOREIGN KEY question_to_question;");
    }

}
