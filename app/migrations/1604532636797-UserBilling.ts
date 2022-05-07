import {MigrationInterface, QueryRunner} from "typeorm";

export class UserBilling1604532636797 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `user_billing` (`id` int PRIMARY KEY AUTO_INCREMENT,`user_id` int);");
        await queryRunner.query("ALTER TABLE `user_billing` ADD CONSTRAINT user_billing_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query("ALTER TABLE `user_billing` DROP COLUMN `last4`")
        await queryRunner.query("ALTER TABLE `user_billing` DROP FOREIGN KEY user_billing_to_user;");
        await queryRunner.query("DROP TABLE `user_billing`");
    }

}
