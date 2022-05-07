import {MigrationInterface, QueryRunner} from "typeorm";

export class Car1606065092564 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `dougs_take`;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `dougs_take` text;");
    }

}
