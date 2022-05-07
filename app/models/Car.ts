import {
    AfterInsert, AfterUpdate,
    BaseEntity, BeforeInsert, BeforeRemove,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn, RelationId,
} from "typeorm";
import { Bid } from "./Bid";
import { User } from "./User";
import { CarImage } from "./CarImage";
import { CarVideo } from "./CarVideo";
import { Comment } from "./Comment";
import { Question } from "./Question";
import moment from "moment";
import { CarWatched } from "./CarWatched";
import { Algolia } from "../helpers/Algolia";
import { UserBilling } from "./UserBilling";
import { Location } from "./Location";
import { carFees } from "../dictionaries/car/fees";

@Index("car_to_user", ["ownerId"], {})
@Index("car_to_user_verified_by", ["verifiedById"], {})
@Index("car_end_date", ["endDate"])
@Index("car_start_date", ["startDate"])
@Entity("car", { schema: "bids" })
export class Car extends BaseEntity {
    static readonly VERIFICATION_STATE = {
        APPLICATION: 1,
        SCHEDULING: 2,
        PAYMENT: 3,
        DONE: 4,
        DENY: 5,
    }

    static readonly VERIFICATION_ROAD = [
        Car.VERIFICATION_STATE.APPLICATION,
        Car.VERIFICATION_STATE.SCHEDULING,
        Car.VERIFICATION_STATE.PAYMENT,
        Car.VERIFICATION_STATE.DONE,
    ]

    static readonly STATUS = {
        Start: 1,
        Pause: 2,
        Continue: 3,
        Restart: 4,
        Finish: 5
    }

    static readonly RESERVE_FEE_AMOUNT = carFees.RESERVE_FEE_AMOUNT * 100
    static readonly NON_RESERVE_FEE_AMOUNT = carFees.NON_RESERVE_FEE_AMOUNT * 100

    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("int", { name: "owner_id", nullable: true })
    ownerId: number | null;

    @Column("int", { name: "location_id", nullable: true })
    locationId: number | null;

    @Column("int", { name: "status", nullable: true })
    status: number | null;

    @Column("tinyint", { name: "reserve", nullable: true, width: 1 })
    reserve: boolean | null;

    @Column("int", { name: "reserve_value", nullable: true })
    reserveValue: number | null;

    @Column("varchar", { name: "title", nullable: true, length: 255 })
    title: string | null;

    @Column("varchar", { name: "make", nullable: true, length: 255 })
    make: string | null

    @Column("varchar", { name: "model", nullable: true, length: 255 })
    model: string | null

    @Column("varchar", { name: "subtitle", nullable: true, length: 255 })
    subtitle: string | null;

    @Column("datetime", { name: "end_date" })
    endDate: Date;

    @Column("datetime", { name: "start_date", nullable: true })
    startDate: Date | null;

    @Column("varchar", { name: "start_after", nullable: true, length: 50 })
    startAfter: string | null;

    @Column("varchar", { name: "history_report", nullable: true, length: 255 })
    historyReport: string | null;

    @Column("varchar", { name: "vin", nullable: true, length: 255 })
    vin: string | null;

    @Column("int", { name: "mileage", nullable: true })
    mileage: number | null;

    @Column("varchar", { name: "body_style", nullable: true, length: 255 })
    bodyStyle: string | null;

    @Column("varchar", { name: "engine", nullable: true, length: 255 })
    engine: string | null;

    @Column("varchar", { name: "drivetrain", nullable: true, length: 255 })
    drivetrain: string | null;

    @Column("varchar", { name: "transmission", nullable: true, length: 255 })
    transmission: string | null;

    @Column("varchar", { name: "exterior_color", nullable: true, length: 255 })
    exteriorColor: string | null;

    @Column("varchar", { name: "interior_color", nullable: true, length: 255 })
    interiorColor: string | null;

    @Column("varchar", { name: "title_status", nullable: true, length: 255 })
    titleStatus: string | null;

    @Column("varchar", { name: "seller_type", nullable: true, length: 255 })
    sellerType: string | null;

    @Column("varchar", { name: "seller_name", nullable: true, length: 255 })
    sellerName: string | null;

    @Column("varchar", { name: "seller_phone", nullable: true, length: 255 })
    sellerPhone: string | null;

    @Column("varchar", { name: "title_owner", nullable: true, length: 255 })
    titleOwner: string | null;

    @Column("varchar", { name: "dealership_name", nullable: true, length: 255 })
    dealershipName: string | null;

    @Column("varchar", { name: "dealership_website", nullable: true, length: 255 })
    dealershipWebsite: string | null;

    @Column("varchar", { name: "additional_fees", nullable: true, length: 255 })
    additionalFees: string | null;

    @Column("varchar", { name: "title_country", nullable: true, length: 255 })
    titleCountry: string | null

    @Column("varchar", { name: "title_province", nullable: true, length: 255 })
    titleProvince: string | null

    @Column("varchar", { name: "title_state", nullable: true, length: 255 })
    titleState: string | null

    @Column("tinyint", { name: "owner_has_title", nullable: true, width: 1 })
    ownerHasTitle: string | null

    @Column("varchar", { name: "year", nullable: true, length: 255 })
    year: string | null

    @Column("text", { name: "highlights", nullable: true })
    highlights: string | null;

    @Column("text", { name: "equipment", nullable: true })
    equipment: string | null;

    @Column("text", { name: "modifications", nullable: true })
    modifications: string | null;

    @Column("tinyint", { name: "verified", nullable: true, width: 1 })
    verified: boolean | null;

    @Column("tinyint", { name: "verification_state", nullable: true })
    verificationState: number | null;

    @Column("text", { name: "verification_description", nullable: true })
    verificationDescription: string | null;

    @Column("int", { name: "verified_by_id", nullable: true })
    verifiedById: number | null;

    @Column("datetime", { name: "verified_date", nullable: true })
    verifiedDate: Date | null;

    @Column("text", { name: "recent_service_history", nullable: true })
    recentServiceHistory: string | null;

    @Column("text", { name: "other_items_included_in_sale", nullable: true })
    otherItemsIncludedInSale: string | null;

    @Column("text", { name: "sellers_ownership_history", nullable: true })
    sellersOwnershipHistory: string | null;

    @Column("text", { name: "seller_notes", nullable: true })
    sellerNotes: string | null;

    @Column("datetime", { name: "created_at" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", nullable: true })
    updatedAt: Date | null;

    @Column("int", { name: "fee_amount", nullable: true })
    feeAmount: number | null;

    @OneToMany(() => Bid, (bid) => bid.car)
    bids: Bid[];

    @OneToMany(() => UserBilling, (userBilling) => userBilling.car)
    carBillings: UserBilling[];

    @ManyToOne(() => User, (user) => user.cars, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "owner_id", referencedColumnName: "id" }])
    owner: User;

    @RelationId((car: Car) => car.owner)
    owner_id: number;

    @ManyToOne(() => User, (user) => user.verifiedCars, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "verified_by_id", referencedColumnName: "id" }])
    verifiedBy: User;

    @RelationId((car: Car) => car.verifiedBy)
    verified_by_id: number;

    @ManyToOne(() => Location, (location) => location.cars)
    @JoinColumn([{ name: "location_id", referencedColumnName: "id" }])
    location: Location;

    @RelationId((car: Car) => car.location)
    location_id: number;

    @OneToMany(() => CarImage, (carImage) => carImage.car)
    carImages: CarImage[];

    @OneToMany(() => CarVideo, (carVideo) => carVideo.car)
    carVideos: CarVideo[];

    @OneToMany(() => Comment, (comment) => comment.car)
    comments: Comment[];

    @OneToMany(() => Question, (question) => question.car)
    questions: Question[];

    @OneToMany(() => CarWatched, (carWatched) => carWatched.car)
    watched: CarWatched[];

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate()
    }

    lessThanMinuteToEnd(): boolean {
        // @ts-ignore
        return moment(this.endDate).subtract(moment()).valueOf() <= 60000
    }

    addMinuteToEnd(): void {
        this.endDate = moment(this.endDate).add(60, 'seconds').toDate()
    }

    addMinuteToEndIfNeeded(): boolean {
        if (this.lessThanMinuteToEnd()) {
            let needed = this.addMinuteToEnd()
            return true
        }
        return false
    }

    static async getCarWithImages(id: number) {
        const car = await Car.createQueryBuilder('car')
            .where('car.id = :id', { id })
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .getOne();

        if (!car) throw new Error()

        return car
    }

    static async getFullCar(id: number, user?: User | null) {
        const carQuery = await Car.createQueryBuilder('car')
            .where('car.id = :id', { id })
            .leftJoinAndSelect('car.carImages', 'carImages')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.location', 'location');

        if (user) {
            carQuery.andWhere('car.ownerId = :ownerId', { ownerId: user.id })
        }

        const car = await carQuery.getOne()

        if (!car) throw new Error()

        return car
    }

    async setNextVerificationStateAndSave() {
        const currentState = Car.VERIFICATION_ROAD.indexOf(this.verificationState as number)
        if (currentState !== -1 && Car.VERIFICATION_ROAD[currentState + 1]) {
            this.verificationState = Car.VERIFICATION_ROAD[currentState + 1]
        }

        if (this.verificationState === Car.VERIFICATION_STATE.DONE) {
            this.verified = true
        }

        if (currentState < 0) {
            this.verificationState = Car.VERIFICATION_ROAD[1]
        }

        return await this.save()
    }

    async setVerificationStateAndSave(state: number) {
        if (Car.VERIFICATION_ROAD.includes(state)) {
            this.verificationState = state
        }

        return await this.save()
    }

    async setFeeAmout(amount: number) {
        this.feeAmount = amount

        return await this.save()
    }

    static async declineCar(id: number, reasonForDecline: string, verifiedBy: User) {
        try {
            const car = await Car.getFullCar(id)
            car.verificationState = Car.VERIFICATION_STATE.DENY
            car.verificationDescription = reasonForDecline
            car.verifiedBy = verifiedBy
            car.verifiedById = verifiedBy.id
            car.verifiedDate = moment().toDate()

            return await car.save()
        } catch (error) {
            console.log(error)

            return { success: false }
        }
    }

    static async approveCar(id: number, verifiedBy: User) {
        try {
            const car = await Car.getFullCar(id)
            car.verifiedBy = verifiedBy
            car.verifiedById = verifiedBy.id
            car.verifiedDate = moment().toDate()

            return await car.setVerificationStateAndSave(Car.VERIFICATION_STATE.SCHEDULING)
        } catch (error) {
            console.log(error)
            return { success: false }
        }
    }

    async setStartDateAndSave() {
        switch (this.startAfter) {
            case 'asPossible': {
                this.startDate = moment().toDate()
                break;
            }
            case '2weeks': {
                this.startDate = moment().add(2, 'weeks').toDate()
                break;
            }
            case '3weeks': {
                this.startDate = moment().add(3, 'weeks').toDate()
                break;
            }
            case 'noPreference': {
                this.startDate = moment().add(1, 'd').toDate()
                break;
            }
        }

        this.endDate = moment(this.startDate).add(7, 'd').toDate()

        return await this.save()
    }

    static async getLiveAuctionsCount() {
        return await Car.createQueryBuilder('car')
            .where('car.verified = 1')
            .andWhere('car.status != :paused', { paused: Car.STATUS.Pause })
            .andWhere('car.endDate > CURRENT_TIMESTAMP')
            .andWhere('car.startDate <= CURRENT_TIMESTAMP')
            .getCount()
    }

    static async getLiveAuctions() {
        return await Car.createQueryBuilder('car')
            .where('car.verified = 1')
            .andWhere('car.status != :paused', { paused: Car.STATUS.Pause })
            .andWhere('car.endDate > CURRENT_TIMESTAMP')
            .andWhere('car.startDate <= CURRENT_TIMESTAMP')
            .getMany()
    }

    static async getPendingAuctionsCount() {
        return await Car.createQueryBuilder('car')
            .where('car.verificationState < 4 AND car.verified != 1')
            .getCount()
    }

    static async getTodayClosedCarsAndCount() {
        const startDate = moment().startOf('day').toDate()
        const endDate = moment().endOf('day').toDate()

        return await Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.bids', 'bids')
            .where('car.verified = 1')
            .andWhere('car.endDate >= :startDate AND car.endDate <= :endDate', {
                startDate,
                endDate
            })
            .andWhere('car.startDate < CURRENT_TIMESTAMP')
            .getManyAndCount()
    }

    static getQueryFullCar() {
        const statusQuery = `
            CASE
                WHEN car.verified = 1 AND car.startDate < NOW() THEN
                    CASE
                        WHEN car.endDate > NOW()
                        THEN 'ongoing'
                        ELSE 'ended'
                    END
                ELSE
                    'awaiting'
            END
        `

        return Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.carImages', 'images')
            .leftJoinAndSelect('car.carVideos', 'videos')
            .leftJoinAndSelect('car.watched', 'watched')
            .leftJoinAndSelect('car.location', 'location')
            .leftJoinAndSelect('car.verifiedBy', 'verifiedBy')
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select(['car.id AS status_car_id'])
                .addSelect(statusQuery, 'status'),
                'status', 'status.status_car_id = car.id'
            )
            .addSelect('CASE WHEN car.startDate < NOW() AND car.endDate > NOW() THEN 1 ELSE -1 END', 'ongoing')
            .orderBy('ongoing', 'DESC')
            .addOrderBy('car.startDate', 'DESC')
    }

    static async getAuctionsCounts(isNewAuctions: boolean, timePeriodType: string, startDate: string, endDate: string) {
        let filterValue = isNewAuctions ? 'createdAt' : 'endDate'
        let timeFunction = timePeriodType === 'year'
            ? 'month' : (timePeriodType === 'all' ? 'year' : 'day')
        const countsQuery = await Car.createQueryBuilder('car')
            .innerJoin('car', 'filtered_cars', 'filtered_cars.id = car.id')
            .select(`${timeFunction}(car.${filterValue})`, 'period')
            .addSelect('COUNT(*)', 'count')
            .where('car.verified = 1')
            .andWhere(`filtered_cars.${filterValue} < NOW()`)
            .groupBy('period')
            .orderBy('period')

        if (timePeriodType !== 'all') {
            countsQuery.andWhere(`filtered_cars.${filterValue} >= DATE(:startDate)`, { startDate })
            countsQuery.andWhere(`filtered_cars.${filterValue} <= DATE(:endDate)`, { endDate })
        }
        const counts = await countsQuery.getRawMany()

        return counts
    }

    static getRevenueQuery() {
        const isReserveMet = 'car.reserve = 1 AND IFNULL(max_bid,0) >= IFNULL(car.reserve_value,0)'
        const isNonReserveMet = 'car.reserve = 0 AND max_bid > 0'
        const buyerFee = `LEAST(GREATEST(IFNULL(max_bid,0) * ${carFees.TAX_RATIO / 100}, ${carFees.MIN_FEE}), ${carFees.MAX_FEE})`
        const sellerFee = `IFNULL(car.fee_amount / 100, CASE WHEN car.reserve = 1 THEN ${carFees.RESERVE_FEE_AMOUNT} ELSE ${carFees.NON_RESERVE_FEE_AMOUNT} END)`

        return `
            CASE
                WHEN (${isReserveMet}) OR (${isNonReserveMet})
                    THEN ${buyerFee} + ${sellerFee}
                ELSE ${sellerFee}
            END
        `
    }

    static async getRevenueByMonth(timePeriodType: string, startDate: string, endDate: string) {
        let timeFunction = timePeriodType === 'year'
            ? 'month' : (timePeriodType === 'all' ? 'year' : 'day')

        const revenueByCarQuery = `SUM(${this.getRevenueQuery()})`

        const revenueQuery = Car.createQueryBuilder('car')
            .where('verified = 1')
            .andWhere('car.endDate < NOW()')
            .leftJoinAndSelect(query => {
                const sc = query
                    .from(Bid, 'bid')
                    .select('bid.car')
                    .addSelect('MAX(bid.bid)', 'max_bid')
                    .leftJoinAndSelect('bid.car', 'joined_car')
                    .groupBy('bid.car')
                    .where('joined_car.verified = 1')
                    .andWhere('joined_car.end_date < NOW()')

                return sc
            }, 'max_bids', 'max_bids.car_id = car.id')
            .select(`${timeFunction}(car.endDate)`, 'period')
            .addSelect(revenueByCarQuery, 'revenue')
            .groupBy('period')
            .having('revenue IS NOT NULL')
            .orderBy('period')


        if (timePeriodType !== 'all') {
            revenueQuery.andWhere(`car.endDate >= DATE(:startDate)`, { startDate })
            revenueQuery.andWhere(`car.endDate <= DATE(:endDate)`, { endDate })
        }

        const revenue = await revenueQuery.getRawMany()

        return revenue
    }

    async getFirstImage() {
        return await CarImage.findOneOrFail({
            where: {
                carId: this.id,
                type: CarImage.TYPE_EXTERIOR
            }
        })
    }

    getDataForAlgolia(): object {
        return {
            objectID: this.id,
            ownerId: this.ownerId,
            reserve: this.reserve,
            title: this.title,
            subtitle: this.subtitle,
            endDate: this.endDate,
            historyReport: this.historyReport,
            location: this.location,
            vin: this.vin,
            mileage: this.mileage,
            bodyStyle: this.bodyStyle,
            engine: this.engine,
            drivetrain: this.drivetrain,
            transmission: this.transmission,
            exteriorColor: this.exteriorColor,
            interiorColor: this.interiorColor,
            titleStatus: this.titleStatus,
            sellerType: this.sellerType,
            highlights: this.highlights,
            equipment: this.equipment,
            modifications: this.modifications,
            // knownFlaws: this.knownFlaws,
            recentServiceHistory: this.recentServiceHistory,
            otherItemsIncludedInSale: this.otherItemsIncludedInSale,
            sellersOwnershipHistory: this.sellersOwnershipHistory,
            sellerNotes: this.sellerNotes,
        }
    }

    @AfterInsert()
    afterInsert() {
        Algolia.addOrUpdateCar(this)
    }

    @AfterUpdate()
    afterUpdate() {
        Algolia.addOrUpdateCar(this)
    }

    @BeforeRemove()
    beforeRemove() {
        Algolia.removeCar(this.id)
    }
}
