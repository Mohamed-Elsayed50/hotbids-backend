import {MigrationInterface, QueryRunner} from "typeorm";

export class Comment1605425070352 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `comment` DROP FOREIGN KEY `comment_to_comment`;");
        await queryRunner.query("ALTER TABLE `comment` ADD CONSTRAINT `comment_to_comment` FOREIGN KEY (`reply_to_comment_id`) REFERENCES `comment` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `comment` DROP FOREIGN KEY `comment_to_comment`;");
        await queryRunner.query("ALTER TABLE `comment` ADD CONSTRAINT comment_to_comment FOREIGN KEY (`reply_to_comment_id`) REFERENCES `comment` (`id`);");
    }

}
