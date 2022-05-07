import {MigrationInterface, QueryRunner} from "typeorm";

export class Page1604532961042 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `page` (`id` int PRIMARY KEY AUTO_INCREMENT,`name` varchar(255),`url` varchar(255),`title` varchar(255),`description` varchar(255));");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `page`");
    }

}
