import { Request, Response } from 'express'
import { User } from '../models/User'
import { Car } from '../models/Car';
import { Bid } from '../models/Bid';
import { Metric, MetricTypes, MetricThemes } from '../dictionaries/metrics';
import { Comment } from '../models/Comment';
import SocketController from './SocketController';
import { CarImage } from '../models/CarImage';
import { Statistic, StatisticTypes } from '../models/Statistic';
import moment from 'moment';
import { UserRole } from '../dictionaries/user/UserRole';
import { ErrorUserAccessDenied } from '../dictionaries/validation/UserRole';

class StatisticalController {
    static readonly timePeriods = {
        week: 1,
        month: 2,
        year: 3,
        all: 4,
    }

    static async getMetrics(req: Request, res: Response) {
        res.status(200).send(await Statistic.getMetrics())
    }

    static async getChartsData(req: Request, res: Response) {
        const getPeriodBounds = (period, date) => {
            return {
                periodStartDate: moment(date).startOf(period).format('YYYY-MM-DD HH:mm'),
                periodEndDate: moment(date).endOf(period).format('YYYY-MM-DD HH:mm')
            }
        }
        const timePeriod = (req.query.period || 'year') as string
        const date = (req.query.date || moment()) as string
        let { periodStartDate, periodEndDate } = getPeriodBounds('year', date)
        let expectedCount = 12
        let newAuctionsCounts
        let closedAuctionsCounts
        let revenueCounts
        let periodStart = 1

        if (StatisticalController.timePeriods[timePeriod]) {
            switch (StatisticalController.timePeriods[timePeriod]) {
                case StatisticalController.timePeriods.week:
                    ({ periodStartDate, periodEndDate } = getPeriodBounds('week', date))
                    periodStart = Number(moment().weekday(0).format('DD'))
                    expectedCount = 7
                    break
                case StatisticalController.timePeriods.month:
                    ({ periodStartDate, periodEndDate } = getPeriodBounds('month', date))
                    expectedCount = moment(date).daysInMonth()
                    break
                case StatisticalController.timePeriods.year:
                    break
                case StatisticalController.timePeriods.all:
                    expectedCount = 0
                    break
            }

            newAuctionsCounts = await Car.getAuctionsCounts(true, timePeriod, periodStartDate, periodEndDate)
            closedAuctionsCounts = await Car.getAuctionsCounts(false, timePeriod, periodStartDate, periodEndDate)
        }

        revenueCounts = await Car.getRevenueByMonth(timePeriod, periodStartDate, periodEndDate)

        for (let i = periodStart; i < periodStart + expectedCount; i++) {
            if (newAuctionsCounts && !newAuctionsCounts.find(ac => ac.period === i)) {
                newAuctionsCounts.splice(i - periodStart, 0, { period: i, count: 0 })
            }
            if (closedAuctionsCounts && !closedAuctionsCounts.find(ac => ac.period === i)) {
                closedAuctionsCounts.splice(i - periodStart, 0, { period: i, count: 0 })
            }
            if (revenueCounts && !revenueCounts.find(ac => ac.period === i)) {
                revenueCounts.splice(i - periodStart, 0, { period: i, revenue: 0 })
            }
        }

        res.status(200).send({
            newAuctionsCounts,
            closedAuctionsCounts,
            revenueCounts
        })
    }

    static async getUsers(req: Request, res: Response) {
        let limit = parseInt(req.query.limit as string) || 10
        let offset = parseInt(req.query.offset as string) || 0
        let search = req.query.search

        let usersQuery = User.getUserManagerQuery()

        if (search) {
            let searchQuery = `
                user.username LIKE :searchTerm
                OR user.id LIKE :searchTerm
                OR user.email LIKE :searchTerm
                OR last_car.last_car_title LIKE :searchTerm
            `
            const searchQueryVars = {
                searchTerm: `%${search}%`,
            }

            usersQuery.andWhere(`(${searchQuery})`, searchQueryVars)
        }

        if (limit) {
            usersQuery.limit(limit)
        }

        if (offset) {
            usersQuery.offset(offset)
        }

        let users = await usersQuery.getRawMany()

        const count = await usersQuery.getCount()

        res.status(200).send({ users, count })
    }

    static async getManagers(req: Request, res: Response) {
        const usersQuery = User.createQueryBuilder('user')
            .where('user.role < :role', { role: UserRole.RoleUser })
            .orderBy('user.createdAt', 'DESC')
            .take(10)
            .skip(0)

        if (req.query.take) {
            usersQuery.take(Number(req.query.take))
        }

        if (req.query.skip) {
            usersQuery.skip(Number(req.query.skip))
        }

        if (req.query.search) {
            let searchQuery = `
                user.username LIKE :query
                OR user.email LIKE :query
            `
            const searchQueryVars = {
                query: `%${req.query.search}%`,
            }
            usersQuery.andWhere(`(${searchQuery})`, searchQueryVars)

        }

        const [users, count] = await usersQuery.getManyAndCount()

        return res.status(200).send({
            users,
            count
        })
    }

    static async getAuctions(req: Request, res: Response) {
        const statusQuery = `
            CASE
                WHEN car.startDate < NOW() THEN
                    CASE
                        WHEN car.status = ${Car.STATUS.Pause} THEN 'pause'
                        WHEN car.endDate > NOW() THEN 'in progress'
                        ELSE 'ended'
                    END
                ELSE
                    'awaiting'
            END
        `
        let carsQuery = Car.createQueryBuilder('car')
            .where('car.verified = 1')
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
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select(['car.id AS auction_car_id'])
                .addSelect('CASE WHEN car.reserve = 1 THEN "reserve" ELSE "no reserve" END', 'auction_kind'),
                'auction_kind', 'auction_kind.auction_car_id = car.id'
            )
            .skip(req.query.skip ? Number(req.query.skip) : 0)
            .addSelect('CASE WHEN car.startDate < NOW() AND car.endDate > NOW() THEN 1 ELSE -1 END', 'ongoing')
            .orderBy('ongoing', 'DESC')
            .addOrderBy('car.startDate', 'DESC')

        if (req.query.take) {
            carsQuery.take(Number(req.query.take))
        }

        if (req.query.search) {
            let searchQuery = `
                car.title LIKE :query
                OR owner.username LIKE :query
                OR verifiedBy.username LIKE :query
                OR status.status LIKE :query
                OR auction_kind.auction_kind LIKE :kind
            `
            const searchQueryVars = {
                query: `%${req.query.search}%`,
                kind: `${req.query.search}%`
            }
            carsQuery.andWhere(`(${searchQuery})`, searchQueryVars)
        }

        let [cars, carsCount] = await carsQuery.getManyAndCount()

        if (!cars) {
            res.status(404).send('cars not found')
            return
        }
        res.status(200).send({
            cars: cars,
            carsCount: carsCount
        })
    }

    static async getCars(req: Request, res: Response) {
        const VERIFICATION_STATE = Car.VERIFICATION_STATE
        const stateQuery = `
            CASE
                WHEN car.verified = 1 THEN 'Auction'
                WHEN car.verificationState = ${VERIFICATION_STATE.APPLICATION} THEN 'Application'
                WHEN car.verificationState = ${VERIFICATION_STATE.SCHEDULING} THEN 'Scheduling'
                WHEN car.verificationState = ${VERIFICATION_STATE.PAYMENT} THEN 'Payment'
                WHEN car.verificationState = ${VERIFICATION_STATE.DONE} THEN 'Auction'
                ELSE 'Application'
            END
        `
        const statusQuery = `
            CASE 
                WHEN car.verificationState = ${VERIFICATION_STATE.DENY} THEN 'declined'
                WHEN car.verified_by_id IS NOT NULL AND car.verificationState != ${VERIFICATION_STATE.DENY} 
                THEN 'approved'
                ELSE ''
            END
        `

        let carsQuery = Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.carImages', 'images')
            .leftJoinAndSelect('car.carVideos', 'videos')
            .leftJoinAndSelect('car.watched', 'watched')
            .leftJoinAndSelect('car.location', 'location')
            .leftJoinAndSelect('car.verifiedBy', 'verifiedBy')
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select(['car.id AS state_car_id'])
                .addSelect(stateQuery, 'state'),
                'state', 'state.state_car_id = car.id'
            )
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select(['car.id AS status_car_id'])
                .addSelect(statusQuery, 'status'),
                'status', 'status.status_car_id = car.id'
            )
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select(['car.id AS auction_car_id'])
                .addSelect('CASE WHEN car.reserve = 1 THEN "reserve" ELSE "no reserve" END', 'auction_kind'),
                'auction_kind', 'auction_kind.auction_car_id = car.id'
            )
            .addSelect('CASE WHEN state.state = "Application" THEN 1 ELSE -1 END', 'new_application')
            .skip(req.query.skip ? Number(req.query.skip) : 0)
            .orderBy('new_application', 'DESC')
            .addOrderBy('car.createdAt', 'DESC')

        if (req.query.take) {
            carsQuery.take(Number(req.query.take))
        }

        if (req.query.search) {
            carsQuery.where('car.title LIKE :query', { query: `%${req.query.search}%` })
            carsQuery.orWhere('car.make LIKE :query', { query: `%${req.query.search}%` })
            carsQuery.orWhere('car.model LIKE :query', { query: `%${req.query.search}%` })
            carsQuery.orWhere('owner.username LIKE :query', { query: `%${req.query.search}%` })
            carsQuery.orWhere('state.state LIKE :query', { query: `%${req.query.search}%` })
            carsQuery.orWhere('status.status LIKE :query', { query: `%${req.query.search}%` })
            carsQuery.orWhere('auction_kind.auction_kind LIKE :kind', { kind: `${req.query.search}%` })
        }

        let [cars, carsCount] = await carsQuery.getManyAndCount()

        if (!cars) {
            res.status(404).send('cars not found')
            return
        }
        res.status(200).send({
            cars: cars,
            carsCount: carsCount
        })
    }

    static async getCommets(req: Request, res: Response) {
        let take = parseInt(req.query.take as string) || 10
        let skip = parseInt(req.query.skip as string) || 0
        let search = req.query.search

        let commentsQuery = Comment.getUserManagerQuery()

        if (search) {
            commentsQuery
                .andWhere('(user.username LIKE :searchTerm OR comment.comment LIKE :searchTerm)', { searchTerm: `%${search}%` })
        }

        if (take) {
            commentsQuery.take(take)
        }

        if (skip) {
            commentsQuery.skip(skip)
        }

        const [comments, count] = await commentsQuery.getManyAndCount()

        res.status(200).send({ comments, count })
    }

    static async getSalesRevenue(req: Request, res: Response) {
        const revenueFromCarQuery = Car.getRevenueQuery()

        const revenueQuery = Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.owner', 'seller')
            .leftJoinAndSelect(query => query
                .from(Bid, 'bid')
                .select('bid.carId', 'max_bids_car_id')
                .addSelect('MAX(bid.bid)', 'max_bid')
                .leftJoin('bid.car', 'bid_car')
                .leftJoinAndSelect('bid.user', 'buyer')
                .where('bid_car.verified = 1')
                .andWhere('bid_car.end_date < NOW()')
                .groupBy('bid.car'), 'max_bids', 'max_bids.max_bids_car_id = car.id')
            .leftJoinAndSelect(query => query
                .from(CarImage, 'carImage')
                .select('carImage.car_id', 'image_car_id')
                .addSelect('carImage.url', 'image_car_url')
                .leftJoin('carImage.car', 'image_car')
                .groupBy('carImage.car'), 'car_images', 'car_images.image_car_id = car.id')
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select(['car.id AS auction_car_id'])
                .addSelect('CASE WHEN car.reserve = 1 THEN "reserve" ELSE "no reserve" END', 'auction_kind'),
                'auction_kind', 'auction_kind.auction_car_id = car.id')
            .addSelect(revenueFromCarQuery, 'total_revenue')
            .where('car.verified = 1')
            .andWhere('car.endDate < NOW()')
            .orderBy('car.endDate', 'DESC')

        if (req.query.search) {
            let searchQuery = `
                car.title LIKE :query
                OR car.make LIKE :query
                OR car.model LIKE :query
                OR car.year LIKE :query
                OR seller.username LIKE :query
                OR max_bids.buyer_username LIKE :query
                OR auction_kind.auction_kind LIKE :kind
            `
            const searchQueryVars = {
                query: `%${req.query.search}%`,
                kind: `${req.query.search}%`
            }
            revenueQuery.andWhere(`(${searchQuery})`, searchQueryVars)
        }

        const cars = await revenueQuery.getRawMany()
        const carsCount = cars.length
        const skip = Number(req.query.skip) || 0
        const take = Number(req.query.take) || 10
        const carsResult: any[] = []
        let totalRevenue = 0

        for (let i = 0; i < carsCount; i++) {
            totalRevenue += Number(cars[i].total_revenue)
            if (i >= skip && i < take + skip) {
                carsResult.push(cars[i])
            }
        }

        if (!cars) {
            res.status(404).send('cars not found')
            return
        }
        res.status(200).send({
            cars: carsResult,
            carsCount: carsCount,
            totalRevenue: totalRevenue
        })
    }

    static async getManagerHistory(req: Request, res: Response) {
        const user = User.getAuthenticatedUser(req)

        if (!user) {
            return res.status(401).json(new ErrorUserAccessDenied())
        }

        const carsQuery = Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.carImages', 'images')
            .where({ verifiedBy: user })
            .orderBy('car.verifiedDate', 'DESC')

        if (req.query.take) {
            carsQuery.take(Number(req.query.take))
        }

        if (req.query.skip) {
            carsQuery.skip(Number(req.query.skip))
        }

        const [cars, carsCount] = await carsQuery.getManyAndCount()

        if (!cars) {
            res.status(404).send('cars not found')
            return
        }

        res.status(200).send({
            cars: cars,
            carsCount: carsCount
        })
    }
}

export default StatisticalController;
