import { MigrationInterface, QueryRunner } from "typeorm";

export class CarFeeAmount1619166985550 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` ADD COLUMN `fee_amount` int;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `car` DROP COLUMN `fee_amount`;");
    }

}
