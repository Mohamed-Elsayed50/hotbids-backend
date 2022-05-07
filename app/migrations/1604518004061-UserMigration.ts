import {MigrationInterface, QueryRunner} from "typeorm";

export class UserMigration1604518004061 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `user` (`id` int PRIMARY KEY AUTO_INCREMENT, `email` varchar(255), `username` varchar(255), `zip` varchar(255), `phone_number` varchar(255), `verified` tinyint, `reputation` int);");
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `bio` varchar(255);")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `send_daily_email` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `send_week_review_email` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_when_mentioned_comment` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_when_someone_replies_in_comment` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `play_sound_when_bids_placed` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_before_auction_ends_in_watch_list` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_new_bids_in_watch_list` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_new_comment_in_watch_list` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_when_question_answered_in_watch_list` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `notify_auction_results_in_watch_list` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `send_watch_list_notification_via_email` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `send_new_comments_via_email` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `send_new_bids_via_email` tinyint;")
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `created_at` datetime;")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `bio`, `send_daily_email`, `send_week_review_email`, `notify_when_mentioned_comment`, `notify_when_someone_replies_in_comment`, `play_sound_when_bids_placed`, `notify_before_auction_ends_in_watch_list`, `notify_new_bids_in_watch_list`, `notify_new_comment_in_watch_list`, `notify_when_question_answered_in_watch_list`, `notify_auction_results_in_watch_list`, `send_watch_list_notification_via_email`, `send_new_comments_via_email`, `send_new_bids_via_email`, `created_at`;");
        await queryRunner.query("DROP TABLE `user`;");
    }

}
