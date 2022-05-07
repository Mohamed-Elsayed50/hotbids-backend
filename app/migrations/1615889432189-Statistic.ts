import {MigrationInterface, QueryRunner} from "typeorm";

export class Statistic1615889432189 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `statistic` (`id` int PRIMARY KEY AUTO_INCREMENT,`type` tinyint,`created_at` datetime,`value` int);");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `question`");
    }
}
