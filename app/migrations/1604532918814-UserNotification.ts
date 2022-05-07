import {MigrationInterface, QueryRunner} from "typeorm";

export class UserNotification1604532918814 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `user_notification` (`id` int PRIMARY KEY AUTO_INCREMENT,`user_id` int,`daily_email` bool,`mentioned_in_comments` bool,`replies_to_me_in_comments` bool,`play_sound_when_bids_are_placed` bool,`2_hours_before_auction_ends` bool,`new_bids_on_watched_auction` bool,`new_comments_on_watched_auction` bool,`questions_answered` bool,`auctions_results` bool,`watch_list_notifications_also_via_email` bool,`new_comments_via_email` bool,`new_bids_via_email` bool);");
        await queryRunner.query("ALTER TABLE `user_notification` ADD CONSTRAINT user_notification_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_notification` DROP FOREIGN KEY user_notification_to_user;");
        await queryRunner.query("DROP TABLE `user_notification`");
    }

}
