import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {Page} from "./Page";

@Index("page_option_to_page", ["pageId"], {})
@Entity("page_option", {schema: "bids"})
export class PageOption extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "page_id", nullable: true})
    pageId: number | null;

    @Column("varchar", {name: "key", nullable: true, length: 255})
    key: string | null;

    @Column("varchar", {name: "title", nullable: true, length: 255})
    title: string | null;

    @Column("varchar", {name: "val", nullable: true, length: 255})
    val: string | null;

    @ManyToOne(() => Page, (page) => page.pageOptions, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "page_id", referencedColumnName: "id"}])
    page: Page;
}
