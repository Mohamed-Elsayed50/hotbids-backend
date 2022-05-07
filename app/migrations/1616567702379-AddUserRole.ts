import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserRole1616567702379 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD COLUMN `role` tinyint;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `role`;");
    }
}
