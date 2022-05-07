import moment from "moment";
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("subscriber", { schema: "subscriber" })
@Unique(["email"])
export class Subscriber extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("varchar", { name: "email", nullable: true, length: 255 })
    email: string | null;

    @Column("datetime", { name: "created_at" })
    createdAt: Date;

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate()
    }

    static async addNewSubscriber(email) {
        let newSubscriber = new Subscriber()
        newSubscriber.email = email

        await newSubscriber.save()

        return newSubscriber
    }
}
