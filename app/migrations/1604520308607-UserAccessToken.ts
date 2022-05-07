import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAccessToken1604520308607 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `user_access_token` (`id` int PRIMARY KEY AUTO_INCREMENT,`user_id` int,`token` varchar(255),`expire` datetime);");
        await queryRunner.query("ALTER TABLE `user_access_token` ADD CONSTRAINT user_access_token_to_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_access_token` DROP FOREIGN KEY user_access_token_to_user;");
        await queryRunner.query("DROP TABLE `user_access_token`");
    }

}
