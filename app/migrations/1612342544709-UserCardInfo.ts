import {MigrationInterface, QueryRunner} from "typeorm";

export class UserCardInfo1612342544709 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `stripe_customer_id` varchar(255) NULL DEFAULT NULL;");
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `stripe_payment_method_id` varchar(255) NULL DEFAULT NULL;");
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `stripe_last_4` varchar(8) NULL DEFAULT NULL;");

        await queryRunner.query("ALTER TABLE `user_billing` DROP COLUMN `stripe_user_id`;");
        await queryRunner.query("ALTER TABLE `user_billing` DROP COLUMN `stripe_payment_method`;");

        await queryRunner.query("ALTER TABLE `user_billing` ADD COLUMN `car_id` int;");
        await queryRunner.query("ALTER TABLE `user_billing` ADD CONSTRAINT user_billing_to_car FOREIGN KEY (`car_id`) REFERENCES `car` (`id`) ON DELETE CASCADE;");
        await queryRunner.query("ALTER TABLE `user_billing` ADD COLUMN `payment_intent_id` varchar(255) NULL DEFAULT NULL;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_billing` DROP COLUMN `payment_intent_id` varchar(255) NULL DEFAULT NULL;");
        await queryRunner.query("ALTER TABLE `user_billing` DROP FOREIGN KEY user_billing_to_car;");

        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `stripe_customer_id`;");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `stripe_payment_method_id`;");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `stripe_last_4`;");
    }

}
