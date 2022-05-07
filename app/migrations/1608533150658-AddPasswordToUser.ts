import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPasswordToUser1608533150658 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `password` varchar(255) NULL DEFAULT NULL;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `password`;");
    }

}
