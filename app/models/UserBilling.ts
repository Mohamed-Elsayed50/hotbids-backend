import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import { Car } from "./Car";
import {User} from "./User";

@Index("user_billing_to_user", ["userId"], {})
@Entity("user_billing", {schema: "bids"})
export class UserBilling extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("int", {name: "car_id", nullable: true})
    carId: number | null;

    @Column("varchar", {name: "payment_intent_id", nullable: true, length: 128})
    paymentIntentId: string | null;

    @ManyToOne(() => User, (user) => user.userBillings, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

    @ManyToOne(() => Car, (car) => car.carBillings, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "car_id", referencedColumnName: "id"}])
    car: Car;
}
