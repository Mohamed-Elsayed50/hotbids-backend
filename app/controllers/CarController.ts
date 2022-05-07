import { Algolia } from '../helpers/Algolia';
import { Request, Response } from 'express';
import moment from 'moment';
import { Car } from '../models/Car';
import { CarImage } from '../models/CarImage';
import { CarVideo } from '../models/CarVideo';
import { User } from "../models/User";
import { ErrorSignInUsernameNotFound } from '../dictionaries/validation/UsernameErrors';
import { Location as LocationModel } from '../models/Location'
import { ErrorZipCodeDoesntExist, ErrorCarNotFound, ErrorVINDoesntExist, ErrorAutocheckFailed } from '../dictionaries/validation/CarErrors'
import calculateDistance from '../utils/calculateDistance';
import { Stripe } from '../helpers/Stripe';
import SocketController from './SocketController';
import { Bid } from '../models/Bid';
import { Comment } from '../models/Comment'
import checkVIN from '../helpers/Autocheck';

const { v4 } = require('uuid')

class CarController {
    static readonly carCreateParams = [
        'reserve',
        'reserveValue',
        'title',
        'make',
        'model',
        'subtitle',
        'endDate',
        'historyReport',
        'location',
        'vin',
        'mileage',
        'bodyStyle',
        'engine',
        'drivetrain',
        'transmission',
        'exteriorColor',
        'interiorColor',
        'titleStatus',
        'sellerType',
        'highlights',
        'equipment',
        'modifications',
        'knownFlaws',
        'recentServiceHistory',
        'otherItemsIncludedInSale',
        'sellersOwnershipHistory',
        'sellerNotes',
        'dealershipName',
        'dealershipWebsite',
        'additionalFees',
        'titleCountry',
        'titleProvince',
        'titleState',
        'status',
        'ownerHasTitle',
        'year',
        'sellerName',
        'sellerPhone',
        'titleOwner'
    ]
    static readonly carCreateImagesParams = {
        'carImagesExterior': CarImage.TYPE_EXTERIOR,
        'carImagesInterior': CarImage.TYPE_INTERIOR,
        'carImagesMechanical': CarImage.TYPE_MECHANICAL,
        'carImagesDocs': CarImage.TYPE_DOCS,
        'carImagesOther': CarImage.TYPE_OTHER
    }

    static readonly carSortingParams = {
        listed: 1,
        no_reserve: 2,
        closest: 3,
        oldest: 4,
        newest: 5
    }

    static async getCars(req: Request, res: Response) {
        let carsQuery = Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.carImages', 'images')
            .leftJoinAndSelect('car.watched', 'watched')
            .leftJoinAndSelect('car.location', 'location')
            .skip(req.query.skip ? Number(req.query.skip) : 0)
            .where(Boolean(req.query.past) ? 'car.endDate <= CURRENT_TIMESTAMP' : 'car.endDate > CURRENT_TIMESTAMP')
            .andWhere('car.verified = 1')
            .andWhere('car.startDate <= CURRENT_TIMESTAMP')
            .andWhere('(car.status != :pause OR car.status IS NULL)', { pause: Car.STATUS.Pause })
            .orderBy('car.endDate', req.query.desc ? 'DESC' : 'ASC')

        if (req.query.take) {
            carsQuery.take(Number(req.query.take))
        }

        if (req.query.sort && CarController.carSortingParams[req.query.sort as string]) {
            switch (CarController.carSortingParams[req.query.sort as string]) {
                case CarController.carSortingParams.listed: {
                    carsQuery.orderBy('car.createdAt', 'DESC')
                    break;
                }
                case CarController.carSortingParams.no_reserve: {
                    carsQuery.andWhere('car.reserve = 1')
                    break;
                }
                case CarController.carSortingParams.closest: {
                    break;
                }
            }
        }

        if (req.query.search) {
            const results = await Algolia.getCars(req.query.search as string)
            const hits = results && results.hits
            
            if (hits && hits.length) {
                const titles = hits.map(hit => hit.title)
                carsQuery.andWhere('car.title IN (:...titles)', { titles })
            }

            if (hits && hits.length === 0) {
                carsQuery.andWhere('car.title = :title', { title: '' })
            }
        }

        if (req.query.country) {
            carsQuery.andWhere('location.country = :country', { country: req.query.country })
        }

        if (req.query.all) {
            carsQuery.where('car.id')
        }

        let [cars, carsCount] = await carsQuery.getManyAndCount()

        if (!cars) {
            return res.status(404).send('cars not found')
        }

        if (!req.query.country && req.query.zip) {
            try {
                cars = await calculateDistance(req.query.zip as string, Number(req.query.distance), cars)
            } catch (error) {
                return res.status(400).send(new ErrorZipCodeDoesntExist())
            }

        }

        return res.status(200).send({
            cars: cars,
            carsCount: carsCount
        })
    }

    static async getCar(req: Request, res: Response) {
        let carQuery = await Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('bids.user', 'bidsUser')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.carImages', 'images')
            .leftJoinAndSelect('car.carVideos', 'videos')
            .leftJoinAndSelect('car.watched', 'watched')
            .leftJoinAndSelect('car.location', 'location')
            .where('car.id = :carId', { carId: req.params.carId })
            // .andWhere('(car.status != :pause OR car.status IS NULL)', { pause: Car.STATUS.Pause }) // TODO: send erorr
            .select([
                'car',
                'owner',
                'images',
                'videos',
                'watched',
                'bids',
                'location',
                'bidsUser.id',
                'bidsUser.username',
                'bidsUser.avatar',
            ]);

        if (!Boolean(req.query.not_verified)) {
            carQuery.andWhere('car.startDate <= CURRENT_TIMESTAMP')
        }

        const car = await carQuery.getOne()

        if (!car) {
            return res.status(404).send('car not found')
        }

        let allow = Boolean(req.query.not_verified) ? !car.verified : car.verified

        if (Boolean(req.query.not_verified)) {
            const currentUser = User.getAuthenticatedUser(req) || { id: null }
            allow = allow && car.ownerId === currentUser.id
        }

        if (!allow) {
            return res.status(404).send('car not found')
        }

        return res.status(200).send(car)
    }

    static async setCarScheduling(req: Request, res: Response) {
        const carId = req.params.carId ? parseInt(req.params.carId) : 0
        if (carId && isNaN(carId) || !req.body.startDate) {
            return res.status(400).send('bad request')
        }

        let car: Car;

        try {
            car = await Car.getFullCar(carId)
        } catch (error) {
            return res.status(404).send('car not found')
        }

        car.startAfter = req.body.startDate

        try {
            await car.setNextVerificationStateAndSave()
        } catch (error) {
            return res.status(400).send('bad request')
        }

        return res.status(200).send(car)
    }

    static async payPlaceCarFee(req: Request, res: Response) {
        const carId = req.params.carId ? parseInt(req.params.carId) : 0
        if (carId && isNaN(carId)) {
            return res.status(400).send('bad request')
        }

        const currentUser = User.getAuthenticatedUser(req)

        if (!currentUser || !currentUser.stripePaymentMethodId) {
            return res.status(400).send('not payment method')
        }

        const { isFirst } = await CarController._checkIfSellsForFirstTime(currentUser)
        const amount = isFirst && Boolean(req.query.reserve) ? Car.RESERVE_FEE_AMOUNT : Car.NON_RESERVE_FEE_AMOUNT
        let car: Car

        try {
            const paymentMethodId = await Stripe.retrievePaymentMethod(currentUser.stripePaymentMethodId)
            let responce = {
                car: null as any,
                intentResponce: {} as any
            }

            if (!req.query.paymentIntentId) {
                responce.intentResponce = await Stripe.createPaymentIntent(paymentMethodId.id, currentUser.stripeCustomerId as string, amount)
            } else {
                responce.intentResponce = await Stripe.confirmPaymentIntent(req.body.paymentIntentId)
            }

            if (responce.intentResponce.success) {
                car = await Car.getFullCar(carId)

                await Promise.all([
                    car.setFeeAmout(amount),
                    car.setNextVerificationStateAndSave(),
                    car.setStartDateAndSave()
                ])

                responce.car = car
            }

            return res.status(200).send(responce)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    static async verifyCar(req: Request, res: Response) {
        const carId = req.params.carId ? parseInt(req.params.carId) : 0
        if (carId && isNaN(carId)) {
            return res.status(404).send('car not found')
        }

        let car: Car;

        try {
            car = await Car.getCarWithImages(carId)
            car.verified = true
            car.verifiedDate = moment().toDate()
            await car.save()

            return res.status(200).send(car)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    static async _checkIfSellsForFirstTime(owner: User) {
        const car = await Car.createQueryBuilder('car')
            .where({ owner })
            .andWhere('car.verified = 1 AND car.verificationState = :state', { state: Car.VERIFICATION_STATE.DONE })
            .getOne()

        return { isFirst: !car }
    }

    static async checkIfSellsForFirstTime(req: Request, res: Response) {
        const user = User.getAuthenticatedUser(req)
        if (!user) {
            return res.status(404).json(new ErrorSignInUsernameNotFound())
        }
        const isFirst = await CarController._checkIfSellsForFirstTime(user)
        res.status(200).send(isFirst)
    }

    static async getUserCars(req: Request, res: Response) {
        const carsQuery = await Car.createQueryBuilder('car')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.carImages', 'images')
            .leftJoinAndSelect('car.location', 'location')
            .where({ owner: User.getAuthenticatedUser(req) })
            .orderBy('car.endDate', req.query.desc ? 'DESC' : 'ASC');

        if (req.query.staging) {
            carsQuery.andWhere('(car.verificationState != :state OR car.verificationState IS NULL)', { state: Car.VERIFICATION_STATE.DONE })
            carsQuery.andWhere('(car.verified = 0 OR car.verified IS NULL)')
        } else if (req.query.not_started) {
            carsQuery
                .andWhere('car.verified = 1')
                .andWhere('car.startDate > CURRENT_TIMESTAMP')
                .orderBy('car.startDate', 'ASC')
        } else {
            carsQuery
                .andWhere('car.verified = :v', { v: 1 })
                .andWhere(Boolean(req.query.past) ? 'car.endDate <= CURRENT_TIMESTAMP' : 'car.endDate > CURRENT_TIMESTAMP')
                .andWhere('car.startDate <= CURRENT_TIMESTAMP')
        }

        if (req.query.sort && CarController.carSortingParams[req.query.sort as string]) {
            switch (CarController.carSortingParams[req.query.sort as string]) {
                case CarController.carSortingParams.newest: {
                    carsQuery.orderBy('car.createdAt', 'DESC')
                    break;
                }
                case CarController.carSortingParams.no_reserve: {
                    carsQuery.andWhere('car.reserve = 1')
                    break;
                }
                case CarController.carSortingParams.oldest: {
                    carsQuery.orderBy('car.createdAt', 'ASC')
                    break;
                }
            }
        }

        const cars = await carsQuery.getMany()

        res.status(200).send(cars)
    }

    static async getAuctionedCars(req: Request, res: Response) {
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
            const [cars, count] = await Car.createQueryBuilder('car')
                .leftJoinAndSelect('car.bids', 'bids')
                .leftJoinAndSelect('car.owner', 'owner')
                .leftJoinAndSelect('car.carImages', 'images')
                .leftJoinAndSelect('car.location', 'location')
                .skip(req.query.skip ? Number(req.query.skip) : 0)
                .where('car.ownerId = :userId', { userId: user.id })
                .andWhere('car.verified = :v', { v: 1 })
                .andWhere('car.startDate <= CURRENT_TIMESTAMP')
                .orderBy('car.endDate', 'DESC')
                .take(9)
                .getManyAndCount();

            return res.status(200).send({ cars, count })

        } catch (error) {
            console.log(error)
            return res.status(400).send('bad request')
        }
    }

    static async postCar(req: Request, res: Response) {
        let car = new Car()
        let location: LocationModel

        const { vin } = req.body
        try {
            const historyReport = await checkVIN(vin)
            car.historyReport = historyReport as string
        } catch (error) {
            if (error instanceof ErrorVINDoesntExist) {
                return res.status(400).send(new ErrorVINDoesntExist())
            }

            return res.status(400).send(new ErrorAutocheckFailed())
        }

        // @ts-ignore
        car.owner = User.getAuthenticatedUser(req)

        try {
            location = await LocationModel.findOrFailLocation(req.body)
        } catch (error) {
            return res.status(400).send(error)
        }

        for (const val of CarController.carCreateParams) {
            if (val in req.body) {
                car[val] = req.body[val]
            }
        }

        car.verificationState = Car.VERIFICATION_STATE.APPLICATION
        car.location = location
        car.endDate = moment().toDate()

        try {
            await car.save()
        } catch (err) {
            return res.status(400).send(err)
        }

        for (const type in CarController.carCreateImagesParams) {
            if (type in req.body) {
                let fileIds = req.body[type]

                if (!Array.isArray(fileIds)) {
                    fileIds = [fileIds]
                }

                for (let index = 0; index < fileIds.length; index++) {
                    const fileId = fileIds[index];
                    try {
                        await CarImage.bindImageToCar(car, fileId)
                    } catch (error) {
                        return res.status(400).send(error)
                    }
                }
            }
        }

        if ('videos' in req.body) {
            let videos = req.body.videos

            if (!Array.isArray(videos)) {
                videos = [videos]
            }

            for (let index = 0; index < videos.length; index++) {
                const videoUrl = videos[index];
                try {
                    await CarVideo.addCarVideo(car, videoUrl)
                } catch (error) {
                    return res.status(400).send(error)
                }
            }
        }

        SocketController.onNewCarAdded(car)

        res.send(car.id.toString())
    }

    static async setState(req: Request, res: Response) {
        let car: Car

        try {
            car = await Car.findOneOrFail(req.params.carId)
        } catch (error) {
            return res.status(204).send(new ErrorCarNotFound())
        }

        const { state, startDate, endDate } = req.query as { startDate: string, [key: string]: any }

        if (!startDate || !endDate) {
            return res.status(400).send()
        }

        const setStartDate = (d, pass?) => {
            const _d = moment().isAfter(d) || pass ? moment().toDate() : d
            if (_d && moment(_d).isValid()) {
                // @ts-ignore
                car.startDate = moment(_d).toDate()
            }
        }

        const setEndDate = (d, pass?) => {
            const _d = moment(car.startDate).isAfter(d) || pass ? moment().add(1, 'd').toDate() : d
            if (_d && moment(_d).isValid()) {
                // @ts-ignore
                car.endDate = moment(_d).toDate()
            }
        }

        const timeFormat = 'YYYY-MM-DD hh:mm:ss'

        switch (Number(state)) {
            case Car.STATUS.Start: {
                car.status = Car.STATUS.Start
                setStartDate(startDate, true)
                setEndDate(endDate || moment(startDate).add(7, 'd').format(timeFormat))

                if (!car.verified || !car.verifiedById) {
                    // @ts-ignore
                    car.verifiedBy = User.getAuthenticatedUser(req)
                }

                break
            }
            case Car.STATUS.Pause: {
                car.status = Car.STATUS.Pause
                break
            }
            case Car.STATUS.Continue: {
                car.status = Car.STATUS.Continue
                break
            }
            case Car.STATUS.Restart: {
                car.status = Car.STATUS.Restart
                setStartDate(startDate, true)

                const _endDate = Math.abs(moment(startDate).diff(endDate, 'd')) < 7 ? moment(startDate).add(7, 'd') : moment(endDate)

                setEndDate(_endDate.format(timeFormat))

                try {
                    const bids = await Bid.find({
                        where: {
                            carId: car.id
                        }
                    })

                    const bidComments = await Comment.find({
                        where: {
                            isBid: 1,
                            carId: car.id
                        }
                    })

                    if (bidComments.length > 0) {
                        await Comment.remove(bidComments)
                    }

                    if (bids.length > 0) {
                        await Bid.remove(bids)
                    }
                } catch (error) {
                    console.log(error)
                }

                break
            }
            case Car.STATUS.Finish: {
                car.endDate = moment().toDate()
                car.status = Car.STATUS.Finish
                break
            }
            default: {
                car.endDate = moment(endDate).toDate()
                car.startDate = moment(startDate).toDate()
            }
        }

        try {
            await car.save()
        } catch (error) {
            console.log(error);
        }

        if (state) {
            SocketController.onChangeCarStatus(car)
        }

        return res.status(200).send('saved!')
    }

    static async putCar(req: Request, res: Response) {
        let car: Car
        let location: LocationModel

        try {
            car = await Car.findOneOrFail(req.params.carId)
        } catch (error) {
            return res.status(204).send(new ErrorCarNotFound())
        }

        if (req.body.vin && req.body.vin !== car.vin) {
            try {
                const historyReport = await checkVIN(req.body.vin)
                car.historyReport = historyReport as string
            } catch (error) {
                return res.status(400).send(new ErrorVINDoesntExist())
            }
        }

        // Car location
        if (req.body.zipCode || req.body.cityAndProvince) {
            try {
                location = await LocationModel.findOrFailLocation(req.body)
            } catch (error) {
                return res.status(400).send(error)
            }

            if (location) {
                car.location = location
            }
        }

        for (const val of CarController.carCreateParams) {
            if (val in req.body) {
                car[val] = req.body[val]
            }
        }

        car.updatedAt = moment().toDate()

        try {
            await car.save()
        } catch (err) {
            return res.status(400).send(err)
        }

        for (const type in CarController.carCreateImagesParams) {
            if (type in req.body) {
                let fileIds = req.body[type]

                if (!Array.isArray(fileIds)) {
                    fileIds = [fileIds]
                }

                for (let index = 0; index < fileIds.length; index++) {
                    const fileId = fileIds[index];
                    try {
                        await CarImage.bindImageToCar(car, fileId)
                    } catch (error) {
                        return res.status(400).send(error)
                    }
                }
            }
        }

        if ('videos' in req.body) {
            try {
                await CarVideo.removeCarVideos(car)
            } catch (error) { }

            let videos = req.body.videos

            if (!Array.isArray(videos)) {
                videos = [videos]
            }

            for (let index = 0; index < videos.length; index++) {
                const videoUrl = videos[index];
                try {
                    await CarVideo.addCarVideo(car, videoUrl)
                } catch (error) {
                    return res.status(400).send(error)
                }
            }
        }

        res.status(204).send(car.id.toString())


        if (car.status !== Car.STATUS.Pause) {
            SocketController.onUpdatedCar(car)
        }
    }

    static async removeCarPhoto(req: Request, res: Response) {
        let carImage: CarImage
        try {
            carImage = await CarImage.findOneOrFail({ where: { id: req.params.imageId } })
            await carImage.remove()
        } catch (error) {
            return res.status(400).send(error)
        }

        res.status(200).send('success')
    }

    static async postCarPhoto(req: Request, res: Response) {
        if (!req['files']) {
            return res.send(400).send('bad request')
        }

        let carImage: CarImage | false = false;

        for (const type in CarController.carCreateImagesParams) {
            if (type in req['files']) {
                const files = req['files'][type]
                const path = 'uploads/car/' + v4() + '-' + files[0].originalname

                try {
                    carImage = await CarImage.addCarImage(
                        null,
                        files[0].path,
                        path,
                        CarController.carCreateImagesParams[type]
                    )
                } catch (error) {
                    return res.status(400).send(error)
                }
            }
        }

        res.status(201).send(carImage)
    }
}

export default CarController
