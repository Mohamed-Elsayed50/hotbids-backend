import { Request, Response } from 'express';
import moment from 'moment';
import { User } from '../models/User';
import { Bid } from '../models/Bid';
import { Car } from "../models/Car";
import { ErrorCantPlaceBid, ErrorCantCreateBid } from '../dictionaries/validation/CommentErrors';
import { ErrorSignInUsernameNotFound } from '../dictionaries/validation/UsernameErrors';
import { Stripe } from '../helpers/Stripe'
import { UserBilling } from '../models/UserBilling';
import CommentController from './CommentController';
import calculateBidFee from '../utils/calculateBidFee'
import { NotificationTypes, UserNotificationHistory } from '../models/UserNotificationHistory';
import BaseController from '../helpers/BaseController';
import { CarWatched } from '../models/CarWatched';
import { createNewBidNotificationContent } from '../dictionaries/notification/BidNotification';
import { CarImage } from '../models/CarImage';

class BidController implements BaseController {

    static async getCarBids(req: Request, res: Response) {
        let bids: Bid[]

        try {
            bids = await Bid.createQueryBuilder('bid')
                .leftJoinAndSelect('bid.user', 'user')
                .where('bid.car_id = :carId', { carId: req.params.carId })
                .select([
                    'bid',
                    'user.id',
                    'user.username',
                    'user.avatar',
                ])
                .getMany()

            if (!bids) {
                throw new Error('404 not found')
            }
        } catch (err) {
            return res.status(404).send('car or bids not found')
        }

        res.status(200).send(bids)
    }

    static async putBidToCar(req: Request, res: Response) {
        let user = User.getAuthenticatedUser(req)
        let car: Car

        try {
            car = await Car.findOneOrFail(req.params.carId)
        } catch (err) {
            return res.status(404).send('car not found')
        }

        let bid = Number(req.body.bid)
        // @ts-ignore
        if (!await Bid.canPlaceBid(user, car, bid)) {
            return res.status(400).send('bad request')
        }

        try {
            // @ts-ignore
            await Bid.createBid(user, car, bid)
        } catch (err) {
            return res.status(400).send('bad request')
        }

        if (car.addMinuteToEndIfNeeded()) {
            await car.save()
        }

        res.sendStatus(204)
    }

    static async placeBidOrFail(params: { bid: number, user: User, car: Car, intentId: any }) {
        const { bid, user, car, intentId } = params
        let placedBid, bidComment, newIntentId;

        if (!await Bid.canPlaceBid(user, car, bid)) {
            throw new ErrorCantPlaceBid()
        }

        try {
            await BidController.findAndCancelUserIntentOrFail(user, intentId)
        } catch (error) { }

        try {
            newIntentId = await BidController.createAndSaveUserIntent(user, car, bid)
        } catch (error) {
            throw error.message
        }

        try {
            placedBid = await Bid.createBid(user, car, bid)
            bidComment = await CommentController._addComment({
                user,
                car: car,
                isBid: true,
                comment: placedBid.bid
            })
        } catch (err) {
            throw new ErrorCantCreateBid()
        }

        try {
            if (car.addMinuteToEndIfNeeded()) {
                await car.save()
            }
        } catch (error) {
            console.log(error)
        }

        try {
            this.createNotifications(car)
        } catch (error) {}

        return {
            placedBid: {
                ...placedBid,
                user
            },
            bidComment,
            intentId: newIntentId,
            carEndDate: car.endDate
        }
    }

    public static async createNotifications(car: Car) {
        const cars = await CarWatched.createQueryBuilder('wcar')
            .where('wcar.car_id = :carId', { carId: car.id })
            .leftJoinAndSelect('wcar.user', 'user')
            .leftJoinAndSelect('wcar.car', 'car')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .leftJoinAndSelect('car.bids', 'bids')
            .andWhere('user.notify_new_bids_in_watch_list = 1')
            .getMany()

        const noitifications: UserNotificationHistory[] = []

        for (const car of cars) {
            const notificationContent = createNewBidNotificationContent(car.car)
            const n = await UserNotificationHistory.addNotification(
                car.user,
                car.car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.NEW_BID
            )

            if (n) {
                noitifications.push(n)
            }
        }

        const notificationContent = createNewBidNotificationContent(car)
        const sellerNotification = await UserNotificationHistory.addNotification(
            car.owner,
            car,
            notificationContent.content,
            notificationContent.url,
            NotificationTypes.NEW_BID,
        )
        if (sellerNotification) {
            noitifications.push(sellerNotification)
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async findAndCancelUserIntentOrFail(user: User, intentId: string) {
        if (intentId) {
            await Stripe.cancelPaymentIntent(intentId)
        } else {
            const userBilling = await UserBilling.findOneOrFail({ where: { userId: user.id } })
            await Stripe.cancelPaymentIntent(userBilling.paymentIntentId as string)
            await userBilling.remove()
        }
    }

    static async createAndSaveUserIntent(user: User, car: Car, bid: number): Promise<string> {
        const intent = await Stripe.createPaymentHold(
            bid * 100, // Convert dollars to cents
            user.stripeCustomerId as string,
            user.stripePaymentMethodId as string
        )

        const billing = new UserBilling()
        billing.paymentIntentId = intent.id
        billing.user = user
        billing.car = car
        await billing.save()
        return intent.id
    }

    static async captureLastUserIntent(params: { car: Car, user: User }) {
        const { car, user } = params
        const winnerBid = await UserBilling.findOneOrFail({
            where: {
                carId: car.id,
                userId: user.id
            },
        })

        const lastBidValue: number = await Bid.getLatestCarBidNumber(car)
        const feeValue = calculateBidFee(lastBidValue * 100)
        // @ts-ignore
        try {
            const response = await Stripe.captureTheFunds(feeValue, winnerBid.paymentIntentId as string)
            console.log(response)
        } catch (error) {
            console.log(error)
        }

    }

    static async findAndCancelCarAllBids(car: Car) {
        const billings = await UserBilling.find({
            where: {
                carId: car.id
            }
        })

        const promisses = billings.map(b => {
            if (!b.paymentIntentId) return
            return BidController.findAndCancelUserIntentOrFail(b.user, b.paymentIntentId)
        }).filter(b => Boolean(b))

        await Promise.allSettled(promisses)
    }

    static async getPaymentFromCaptured(car: Car) {
        let lastBid: Bid | undefined
        
        await BidController.findAndCancelCarAllBids(car).catch(() => {})

        try {
            lastBid = await Bid.getLatestCarBid(car)
        } catch (error) {
            console.log(error);

            return
        }

        if (!lastBid || !lastBid.bid) return
        if (car.reserve && lastBid.bid < (car.reserveValue || 0)) return

        const feeValue = calculateBidFee(lastBid.bid) * 100

        const pay = async () => {
            try {
                if (!lastBid) return
                const stripePaymentMethodId = lastBid.user.stripePaymentMethodId
                if (!stripePaymentMethodId) return

                const paymentMethodId = await Stripe.retrievePaymentMethod(stripePaymentMethodId)

                const responce = await Stripe.createPaymentIntent(paymentMethodId.id, lastBid.user.stripeCustomerId as string, feeValue)

                // @ts-ignore
                if (!responce.success) {
                    // @ts-ignore
                    await Stripe.confirmPaymentIntent(responce.intentId)
                }
            } catch (error) {
                console.log(error);
                
            }
        }

        await Promise.allSettled([
            pay()
        ])
    }

    static async getUserBidHistory(req: Request, res: Response) {
        if (!req.params.username) {
            return res.status(400).json(new ErrorSignInUsernameNotFound())
        }

        let user: User

        try {
            user = await User.findOneOrFail({
                where: {
                    username: req.params.username
                }
            })
        } catch (error) {
            return res.status(404).json(new ErrorSignInUsernameNotFound())
        }

        try {
            let bids = await Bid.createQueryBuilder('bid')
                .leftJoinAndSelect(query => query
                    .from(Bid, 'bid')
                    .select(['bid.car'])
                    .addSelect('MAX(bid.bid)', 'max_bid')
                    .groupBy('bid.car'), 'max_bids', 'bid.car_id = max_bids.car_id')
                .select(['bid.car'])
                .addSelect('COUNT(*)', 'bids_count')
                .addSelect('MAX(bid.bid)', 'max_by_user')
                .addSelect('MAX(max_bids.max_bid)', 'max_overall')
                .where('bid.userId = :userId', { userId: user.id })
                .groupBy('bid.car')
                .getRawMany()
            const count = bids.length
            let wins = 0

            if (count === 0) return res.status(200).send({ bids, count, wins })

            const cars = await Car.createQueryBuilder('car')
                .leftJoinAndSelect('car.carImages', 'images')
                .leftJoinAndSelect('car.location', 'location')
                .leftJoinAndSelect('car.bids', 'bids')
                .where('car.id IN (:...ids)', { ids: [...bids.map(b => b.car_id)] })
                .getMany()

            bids.forEach(bid => {
                bid.car = cars.find(car => car.id === bid.car_id)
                if (moment(bid.car.endDate).isBefore()) {
                    wins += bid.max_by_user === bid.max_overall ? 1 : 0
                }
            })

            bids.sort((a, b) => {
                return moment(b.car.endDate).diff(a.car.endDate);
            })

            if (req.query.skip) bids = bids.slice(Number(req.query.skip))

            bids = bids.slice(0, 9)

            return res.status(200).send({ bids, count, wins })
        } catch (error) {
            console.log(error)
            return res.status(400).send('bad request')
        }
    }
}

export default BidController
