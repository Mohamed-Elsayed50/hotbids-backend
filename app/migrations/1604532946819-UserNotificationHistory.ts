import {MigrationInterface, QueryRunner} from "typeorm";

export class UserNotificationHistory1604532946819 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `user_notification_history` (`id` int PRIMARY KEY AUTO_INCREMENT,`user_id` int,`readed` bool,`content` text,`url` varchar(255),`created_at` datetime);");
        await queryRunner.query("ALTER TABLE `user_notification_history` ADD CONSTRAINT user_notification_history_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `user_notification_history` DROP COLUMN `readed`");
        await queryRunner.query("ALTER TABLE `user_notification_history` ADD COLUMN `unreaded_count` int;");
        await queryRunner.query("ALTER TABLE `user_notification_history` ADD COLUMN `readed_count` int;");
        await queryRunner.query("ALTER TABLE `user_notification_history` ADD COLUMN `updatedAt` datetime;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_notification_history` DROP COLUMN `updatedAt`;");
        await queryRunner.query("ALTER TABLE `user_notification_history` DROP COLUMN `unreaded_count`;");
        await queryRunner.query("ALTER TABLE `user_notification_history` DROP COLUMN `readed_count`;");
        await queryRunner.query("ALTER TABLE `user_notification_history` ADD COLUMN `readed` bool");
        await queryRunner.query("ALTER TABLE `user_notification_history` DROP FOREIGN KEY user_notification_history_to_user;");
        await queryRunner.query("DROP TABLE `user_notification_history`");
    }

}
