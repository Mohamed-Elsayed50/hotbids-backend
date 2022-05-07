import {
    BaseEntity, BeforeInsert,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import {Car} from "./Car";
import {User} from "./User";
import moment from "moment";

@Unique(["userId", "carId"])
@Index("car_watched_to_user", ["userId"], {})
@Index("car_watched_to_car", ["carId"], {})
@Entity("car_watched", {schema: "bids"})
export class CarWatched extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "car_id", nullable: true})
    carId: number | null;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("datetime", {name: "created_at"})
    createdAt: Date;

    @ManyToOne(() => Car, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "car_id", referencedColumnName: "id"}])
    car: Car;

    @ManyToOne(() => User, (user) => user.carWatcheds, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate();
    }

    static async createCarWatchedAndSave(car: Car, user: User) {
        const carWatched = new CarWatched()
        carWatched.car = car
        carWatched.user = user

        return await carWatched.save()
    }

    static async addToWatched(car: Car, user: User) {
        const alreadyWatched = await CarWatched.findOne({
            where: {
                carId: car.id,
                userId: user.id
            }
        })

        if (!alreadyWatched) {
            await CarWatched.createCarWatchedAndSave(car, user)
        }
    }
}
