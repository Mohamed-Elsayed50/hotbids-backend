import SocketController from '../controllers/SocketController';
import moment from 'moment';
import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BeforeInsert,
} from "typeorm";
import {
    wsRooms,
    wsEvents,
    wsActions
} from '../dictionaries/metrics/ws'
import { Car } from './Car';
import { User } from './User';
import { Comment } from './Comment';
import { Metric, MetricThemes, MetricTypes } from '../dictionaries/metrics';
import { Bid } from './Bid';
import calculateBidFee from '../utils/calculateBidFee';
import { carFees } from "../dictionaries/car/fees";

export enum StatisticTypes {
    LIVE_AUCTIONS,
    PENDING_APPROVAL,
    NEW_COMMENT,
    USER_ONLINE,
    NEW_USER,
    CAR_SALE,
    CAR_SALE_COUNT,
    CLOSED_CARS
}

@Entity("statistic", { schema: "statistic" })
export class Statistic extends BaseEntity {
    static LIVE_AUCTIONS_MAX_COUNT = 0
    static PENDING_APPROVAL_COUNT = 0
    static NEW_COMMENT_COUNT = 0
    static USER_ONLINE_MAX_COUNT = 0
    static NEW_USER_COUNT = 0
    static CAR_SALE_VALUE = 0
    static CAR_SALE_COUNT = 0
    static CLOSED_CARS_COUNT = 0

    static lastSaved = moment().toDate()

    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("tinyint", { name: "type" })
    type: StatisticTypes;

    @Column("int", { name: "value" })
    value: number;

    @Column("datetime", { name: "created_at" })
    createdAt: Date;

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate()
    }

    static async add(type: StatisticTypes, value: number, updateDailyVars = false) {
        const record = new Statistic()
        record.type = type
        record.value = value
        await record.save()
        Statistic.updateDailyVars(type, value)
    }

    static async getMetrics() {
        const liveAuctionsCount = await Car.getLiveAuctionsCount()
        const pendingCarsCount = await Car.getPendingAuctionsCount()
        const newCommentsCount = await Comment.getTodayCommentsCount()
        const [closedTodayCars, closedTodayAuctionsCount] = await Car.getTodayClosedCarsAndCount()
        const usersOnlineCount = SocketController.socketClients.uniqueUsersCount
        const newUsersCount = await User.getTodayRegisteredUsersCount()
        const carsSoldToday = closedTodayAuctionsCount

        const statisticFactory = await Statistic.getStatisticPointsFactory()

        const todaySales = closedTodayCars
            .map(car => ({
                ...car,
                maxBid: Math.max.apply(Math, car.bids.map(bid => bid.bid)),
                feeAmount: car.feeAmount || (car.reserve ? Car.RESERVE_FEE_AMOUNT : Car.NON_RESERVE_FEE_AMOUNT)
            }))

        const todaySalesValue = todaySales.reduce((acc, car) => {
            const revenue = isFinite(car.maxBid) ? calculateBidFee(car.maxBid) : 0
            return acc + revenue + car.feeAmount / 100
        }, 0)

        const todaySalesCount = todaySales.filter(car => car.reserve ? car.maxBid >= (car.reserveValue as number) : car.maxBid).length

        return [
            new Metric(1, MetricTypes.liveAuctions, liveAuctionsCount, statisticFactory(StatisticTypes.LIVE_AUCTIONS)),
            new Metric(2, MetricTypes.pendingApproval, pendingCarsCount, statisticFactory(StatisticTypes.PENDING_APPROVAL), MetricThemes.warning),
            new Metric(3, MetricTypes.newMessage, newCommentsCount, statisticFactory(StatisticTypes.NEW_COMMENT), MetricThemes.blueOne),
            new Metric(4, MetricTypes.autionClosedToday, closedTodayAuctionsCount, statisticFactory(StatisticTypes.CLOSED_CARS), MetricThemes.blueOne),
            new Metric(5, MetricTypes.userOnline, usersOnlineCount, statisticFactory(StatisticTypes.USER_ONLINE), MetricThemes.blueOne),
            new Metric(6, MetricTypes.newRegisteredUser, newUsersCount, statisticFactory(StatisticTypes.NEW_USER), MetricThemes.blue),
            new Metric(7, MetricTypes.todaySales, todaySalesValue, statisticFactory(StatisticTypes.CAR_SALE), MetricThemes.success),
            new Metric(8, MetricTypes.carsSoldToday, todaySalesCount, statisticFactory(StatisticTypes.CAR_SALE_COUNT), MetricThemes.warning),
        ]
    }

    static async sendDailyVars() {
        const pendingCarsCount = await Car.getPendingAuctionsCount()
        const [closedTodayCars, closedTodayAuctionsCount] = await Car.getTodayClosedCarsAndCount()

        const todaySales = closedTodayCars
            .map(car => ({
                ...car,
                maxBid: Math.max.apply(Math, car.bids.map(bid => bid.bid)),
                feeAmount: car.feeAmount || (car.reserve ? Car.RESERVE_FEE_AMOUNT : Car.NON_RESERVE_FEE_AMOUNT)
            }))

        const todaySalesValue = todaySales.reduce((acc, car) => {
            const revenue = isFinite(car.maxBid) ? calculateBidFee(car.maxBid) : 0
            return acc + revenue + car.feeAmount / 100
        }, 0)

        const todaySalesCount = todaySales.filter(car => car.reserve ? car.maxBid >= (car.reserveValue as number) : car.maxBid).length

        SocketController.managers.sendToRoom(
            wsRooms.ROOM_DASHBOARD,
            wsEvents.STATISTICAL_UPDATE_CLOSED_AUCTIONS,
            [MetricTypes.autionClosedToday, closedTodayAuctionsCount]
        )

        SocketController.managers.sendToRoom(
            wsRooms.ROOM_DASHBOARD,
            wsEvents.STATISTICAL_UPDATE_TODAY_CARS_SALED,
            [MetricTypes.carsSoldToday, todaySalesCount]
        )

        SocketController.managers.sendToRoom(
            wsRooms.ROOM_DASHBOARD,
            wsEvents.STATISTICAL_UPDATE_TODAY_SALES,
            [MetricTypes.todaySales, todaySalesValue]
        )

        SocketController.managers.sendToRoom(
            wsRooms.ROOM_DASHBOARD,
            wsEvents.STATISTICAL_UPDATE_PENDING_UPPROVAL,
            [MetricTypes.pendingApproval, pendingCarsCount]
        )
    }

    static async initVars() {
        const liveAuctionsCount = await Car.getLiveAuctionsCount()
        const pendingCarsCount = await Car.getPendingAuctionsCount()
        const newCommentsCount = await Comment.getTodayCommentsCount()
        const [closedTodayCars, closedTodayAuctionsCount] = await Car.getTodayClosedCarsAndCount()
        const newUsersCount = await User.getTodayRegisteredUsersCount()

        const todaySales = closedTodayCars
            .map(car => Math.max.apply(Math, car.bids.map(bid => bid.bid)))
            .reduce((acc, bid) => isFinite(bid) ? acc + bid : acc, 0)

        const carsSoldToday = closedTodayAuctionsCount // TODO: check reserve value

        Statistic.LIVE_AUCTIONS_MAX_COUNT = liveAuctionsCount
        Statistic.PENDING_APPROVAL_COUNT = pendingCarsCount
        Statistic.NEW_COMMENT_COUNT = newCommentsCount
        Statistic.USER_ONLINE_MAX_COUNT = SocketController.socketClients.authenticatedClientsLength
        Statistic.NEW_USER_COUNT = newUsersCount
        Statistic.CLOSED_CARS_COUNT = closedTodayAuctionsCount
        Statistic.CAR_SALE_VALUE = todaySales
        Statistic.CAR_SALE_COUNT = carsSoldToday

    }

    static async getStatisticPointsFactory() {
        const statistic = await Statistic.createQueryBuilder('st')
            .where('TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP, st.createdAt) <= 30')
            .getMany();

        const sales = await Car.createQueryBuilder('car')
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
            .select(`day(car.endDate)`, 'day')
            .addSelect('SUM(max_bids.max_bid)', 'value')
            .addSelect('COUNT(*)', 'count')
            .groupBy('day')
            .having('day <= day(NOW())')
            .orderBy('day')
            .getRawMany();

        const salesResult: number[] = []

        for (let index = 0; index < 31; index++) {
            let value = 0

            const sIndex = sales.findIndex(s => s.day === index)
            if (sIndex >= 0) {
                value = Number(sales[sIndex].value) || 0
            }

            salesResult.push(value)
        }

        return (type: StatisticTypes) => {
            // if (type === StatisticTypes.CAR_SALE) {
            //     return salesResult
            // }

            const typeOfData = statistic.filter(s => s.type === type)
            const dataByDates = typeOfData.reduce((acc, item) => {
                const key = moment(item.createdAt).dayOfYear()
                if (acc[key]) {
                    acc[key] += item.value
                } else {
                    acc[key] = item.value
                }
                return acc
            }, {})

            // @ts-ignore
            return Object.keys(dataByDates).sort((a, b) => new Date(b) - new Date(a)).reverse().map(d => dataByDates[d] as number)
        }
    }

    static async updateDailyVars(type: StatisticTypes, value: number = 0, sendForce = false) {
        if (moment(Statistic.lastSaved).diff(moment(), 'd') <= 0) {
            Statistic.lastSaved = moment().toDate()
        }

        switch (type) {
            case StatisticTypes.USER_ONLINE: {
                Statistic.USER_ONLINE_MAX_COUNT = Statistic.USER_ONLINE_MAX_COUNT >= value ? Statistic.USER_ONLINE_MAX_COUNT : value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_USERS_ONLINE,
                    [MetricTypes.userOnline, value]
                )
                break
            }

            case StatisticTypes.LIVE_AUCTIONS: {
                Statistic.LIVE_AUCTIONS_MAX_COUNT = Statistic.LIVE_AUCTIONS_MAX_COUNT >= value ? Statistic.LIVE_AUCTIONS_MAX_COUNT : value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_LIVE_AUCTIONS,
                    [MetricTypes.liveAuctions, value]
                )
                break
            }

            case StatisticTypes.CLOSED_CARS: {
                Statistic.CLOSED_CARS_COUNT = Statistic.CLOSED_CARS_COUNT + value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_CLOSED_AUCTIONS,
                    [MetricTypes.autionClosedToday, value]
                )

                Statistic.CAR_SALE_COUNT = Statistic.CAR_SALE_COUNT + value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_TODAY_CARS_SALED,
                    [MetricTypes.carsSoldToday, sendForce ? value : Statistic.CAR_SALE_COUNT]
                )
                break
            }

            case StatisticTypes.CAR_SALE: {
                Statistic.CAR_SALE_VALUE = Statistic.CAR_SALE_VALUE + value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_TODAY_SALES,
                    [MetricTypes.todaySales, sendForce ? value : Statistic.CAR_SALE_VALUE]
                )
                break
            }

            case StatisticTypes.NEW_COMMENT: {
                Statistic.NEW_COMMENT_COUNT = Statistic.NEW_COMMENT_COUNT + value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_NEW_MESSAGE,
                    [MetricTypes.newMessage, sendForce ? value : Statistic.NEW_COMMENT_COUNT]
                )
                break
            }

            case StatisticTypes.NEW_USER: {
                Statistic.NEW_USER_COUNT = Statistic.NEW_USER_COUNT + value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_NEW_REGISTERED_USERS,
                    [MetricTypes.newRegisteredUser, sendForce ? value : Statistic.NEW_USER_COUNT]
                )
                break
            }

            case StatisticTypes.PENDING_APPROVAL: {
                Statistic.PENDING_APPROVAL_COUNT = Statistic.PENDING_APPROVAL_COUNT + value
                SocketController.managers.sendToRoom(
                    wsRooms.ROOM_DASHBOARD,
                    wsEvents.STATISTICAL_UPDATE_PENDING_UPPROVAL,
                    [MetricTypes.pendingApproval, sendForce ? value : Statistic.PENDING_APPROVAL_COUNT]
                )
                break
            }
        }
    }

    static async saveDailyVars() {
        Promise.allSettled([
            Statistic.add(StatisticTypes.USER_ONLINE, Statistic.USER_ONLINE_MAX_COUNT),
            Statistic.add(StatisticTypes.LIVE_AUCTIONS, Statistic.LIVE_AUCTIONS_MAX_COUNT),
            Statistic.add(StatisticTypes.CLOSED_CARS, Statistic.CLOSED_CARS_COUNT),
            Statistic.add(StatisticTypes.CAR_SALE, Statistic.CAR_SALE_VALUE)
        ])

        Statistic.LIVE_AUCTIONS_MAX_COUNT = 0
        Statistic.PENDING_APPROVAL_COUNT = 0
        Statistic.NEW_COMMENT_COUNT = 0
        Statistic.USER_ONLINE_MAX_COUNT = 0
        Statistic.NEW_USER_COUNT = 0
        Statistic.CLOSED_CARS_COUNT = 0
        Statistic.CAR_SALE_VALUE = 0
        Statistic.CAR_SALE_COUNT = 0
    }
}
