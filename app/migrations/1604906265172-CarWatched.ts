import {MigrationInterface, QueryRunner} from "typeorm";

export class CarWatched1604906265172 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car_watched` ADD UNIQUE `car_watched_to_user_unique` (`car_id`, `user_id`) USING BTREE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car_watched` DROP INDEX `car_watched_to_user_unique`;");
    }

}
