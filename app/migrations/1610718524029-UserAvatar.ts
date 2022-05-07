import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAvatar1610718524029 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `avatar` varchar(255) NULL DEFAULT NULL;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `avatar`;");
    }

}
