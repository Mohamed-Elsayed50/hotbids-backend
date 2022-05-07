import { MigrationInterface, QueryRunner } from "typeorm";

export class Subscriber1613914393535 implements MigrationInterface {
    name = 'Subscriber1613914393535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `subscriber` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NULL UNIQUE, `created_at` datetime NOT NULL, PRIMARY KEY (`id`));");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `subscriber`");
    }

}
