import {MigrationInterface, QueryRunner} from "typeorm";

export class UserBilling1606686336396 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_billing` ADD COLUMN `stripe_user_id` VARCHAR(128) NULL DEFAULT NULL AFTER `user_id`, ADD COLUMN `stripe_payment_method` VARCHAR(128) NULL DEFAULT NULL AFTER `stripe_user_id`;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_billing` DROP COLUMN `stripe_user_id`, DROP COLUMN `stripe_payment_method`;");
    }

}
