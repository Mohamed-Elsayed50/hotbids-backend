import {MigrationInterface, QueryRunner} from "typeorm";

export class Admin1605042361153 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `admin` (`id` int PRIMARY KEY AUTO_INCREMENT,`email` varchar(255),`password` varchar(255));");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `admin`;");
    }

}
