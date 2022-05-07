import {MigrationInterface, QueryRunner} from "typeorm";

export class PageOption1604532966287 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE IF NOT EXISTS `page_option` (`id` int PRIMARY KEY AUTO_INCREMENT,`page_id` int,`key` varchar(255),`title` varchar(255),`val` varchar(255));");
        await queryRunner.query("ALTER TABLE `page_option` ADD CONSTRAINT page_option_to_page FOREIGN KEY (`page_id`) REFERENCES `page` (`id`) ON DELETE CASCADE;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `page_option` DROP FOREIGN KEY page_option_to_page;");
        await queryRunner.query("DROP TABLE `page_option`");
    }

}
