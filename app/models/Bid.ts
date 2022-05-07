import {BaseEntity, BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Car} from "./Car";
import {User} from "./User";
import {Comment} from "./Comment";
import moment from "moment";
import { CarWatched } from "./CarWatched";

@Index("bid_to_user", ["userId"], {})
@Index("bid_to_car", ["carId"], {})
@Entity("bid", {schema: "bids"})
export class Bid extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "car_id", nullable: true})
    carId: number | null;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("int", {name: "bid", nullable: true})
    bid: number | null;

    @Column("datetime", {name: "created_at"})
    createdAt: Date;

    @ManyToOne(() => Car, (car) => car.bids, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "car_id", referencedColumnName: "id"}])
    car: Car;

    @ManyToOne(() => User, (user) => user.bids, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

    @BeforeInsert()
    async beforeInsert() {
        let momentDate = moment()
        this.createdAt = momentDate.toDate()

        if (!this.carId && this.car) {
            this.carId = this.car.id
        }

        let newComment = new Comment()
        newComment.carId = this.carId
        newComment.userId = this.userId
        newComment.isBid = true
        newComment.comment = (this.bid || '').toString()

        // Memcache.set(`last-car-${this.carId}-bid`, momentDate.valueOf())
    }

    static async getLatestCarBid(car: Car) {
        return await Bid.createQueryBuilder('bid')
            .where({car: car})
            .orderBy("bid.createdAt", "DESC")
            .leftJoinAndSelect('bid.user', 'user')
            .getOne()
    }

    static async getLatestCarBidNumber(car: Car) {
        let maxBidObj = await Bid.getLatestCarBid(car)
        if (maxBidObj && maxBidObj.bid)
            return maxBidObj.bid
        return 0
    }

    static async createBid(user: User, car: Car, bid: number) {
        let newBid = new Bid()
        newBid.userId = user.id
        newBid.carId = car.id
        newBid.bid = bid

        await newBid.save()
        await CarWatched.addToWatched(car, user)

        return newBid
    }

    static async getCarBidsByCarId(carId: number | undefined, lastKnownBidDate: Date | undefined): Promise<Bid[] | undefined> {
        if (!carId)
            return undefined

        let queryBuilder = Bid.createQueryBuilder('bid')
            .where({carId: carId})
            .orderBy("bid.createdAt", "DESC")

        if (lastKnownBidDate)
            queryBuilder.andWhere('bid.createdAt > :lastKnownBidDate', {lastKnownBidDate: lastKnownBidDate})

        return queryBuilder.getMany()
    }

    static async canPlaceBid(user: User, car: Car, bid: number) : Promise<boolean> {
        const latestBid = await Bid.getLatestCarBidNumber(car)
        return car.ownerId !== user.id &&
            bid > latestBid &&
            Math.abs(latestBid - bid) >= 100 &&
            car.endDate.getTime() > Date.now()
    }
}
