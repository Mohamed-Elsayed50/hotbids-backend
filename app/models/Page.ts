import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {PageOption} from "./PageOption";

@Entity("page", {schema: "bids"})
export class Page extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("varchar", {name: "name", nullable: true, length: 255})
    name: string | null;

    @Column("varchar", {name: "url", nullable: true, length: 255})
    url: string | null;

    @Column("varchar", {name: "title", nullable: true, length: 255})
    title: string | null;

    @Column("varchar", {name: "description", nullable: true, length: 255})
    description: string | null;

    @OneToMany(() => PageOption, (pageOption) => pageOption.page)
    pageOptions: PageOption[];

    static async getPageWithOptions(params: any) {
        const page = await Page.createQueryBuilder('page')
            .leftJoinAndSelect('page.pageOptions', 'pageOptions')
            .where(params)
            .getOne()

        if (!page) throw new Error()
        
        return page
    }
}
