import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAuthTables1608533150660 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_verification` (`id` INT(11) NOT NULL AUTO_INCREMENT, `user_id` INT(11) NULL DEFAULT NULL, `token` VARCHAR(256) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci', `expire` TIMESTAMP NULL DEFAULT NULL, PRIMARY KEY (`id`) USING BTREE, INDEX `user_id` (`user_id`) USING BTREE, CONSTRAINT `uverif_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE);");
        await queryRunner.query("CREATE TABLE `user_password_recovery` (`id` INT(11) NOT NULL AUTO_INCREMENT, `user_id` INT(11) NULL DEFAULT NULL, `token` VARCHAR(256) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci', `expire` TIMESTAMP NULL DEFAULT NULL, PRIMARY KEY (`id`) USING BTREE, INDEX `user_id` (`user_id`) USING BTREE, CONSTRAINT `uprecovery_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE);");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_verification` DROP FOREIGN KEY `uverif_ibfk_1`;");
        await queryRunner.query("DROP TABLE `user_verification`;");
        await queryRunner.query("ALTER TABLE `user_password_recovery` DROP FOREIGN KEY `uprecovery_ibfk_1`;");
        await queryRunner.query("DROP TABLE `user_password_recovery`;");
    }

}
