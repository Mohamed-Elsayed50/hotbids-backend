import {Request, Response} from 'express';
import {CarWatched} from '../models/CarWatched';
import {User} from '../models/User';
import {Car} from '../models/Car';
import { SelectQueryBuilder } from 'typeorm';

class CarWatchedController {
    static readonly carWatchedSortingParams = {
        newest: 1,
        oldest: 2,
        no_reserve: 3
    }

    static async getWatchedCars(req: Request, res: Response) {
        let count, cars: Car[]

        try {
            const query = Car.createQueryBuilder('car')
                .leftJoinAndSelect('car.watched', 'watched')
                .leftJoinAndSelect('car.bids', 'bids')
                .leftJoinAndSelect('car.owner', 'owner')
                .leftJoinAndSelect('car.carImages', 'images')
                .where('watched.userId = :userId ', { userId: User.getAuthenticatedUser(req)?.id })
                .andWhere(Boolean(req.query.past) ? 'car.endDate <= CURRENT_TIMESTAMP' : 'car.endDate > CURRENT_TIMESTAMP');

            if (req.query.sort && CarWatchedController.carWatchedSortingParams[req.query.sort as string]) {
                switch(CarWatchedController.carWatchedSortingParams[req.query.sort as string]) {
                    case CarWatchedController.carWatchedSortingParams.newest: {
                        query.orderBy('car.createdAt', 'DESC')
                        break;
                    }
                    case CarWatchedController.carWatchedSortingParams.oldest: {
                        query.orderBy('car.createdAt', 'ASC')
                        break;
                    }
                    case CarWatchedController.carWatchedSortingParams.no_reserve: {
                        query.andWhere('car.reserve = 1')
                        break;
                    }
                }
            } else {
                query.orderBy('car.endDate', 'DESC')
            }

            [cars, count] = await query.getManyAndCount();
        } catch (error) {
            res.status(400).send('bad request')
            return
        }

        res.status(200).send({
            cars,
            count
        })
    }

    static async addCarToWatched(req: Request, res: Response) {
        let car: Car, user = User.getAuthenticatedUser(req)

        try {
            car = await Car.findOneOrFail(req.params.carId)
        } catch (error) {
            res.status(404).send('car not found')
            return
        }

        try {
            // @ts-ignore
            await CarWatched.createCarWatchedAndSave(car, user)
        } catch (e) {
            res.status(400).send(e.code === 'ER_DUP_ENTRY' ? 'already added' : 'bad request')
            return
        }

        res.status(200).send('car added')
    }

    static async deleteWatchedCar(req: Request, res: Response) {
        let carWatched: CarWatched

        try {
            carWatched = await CarWatched.findOneOrFail({
                where: {
                    user: User.getAuthenticatedUser(req),
                    carId: req.params.carId
                }
            })
        } catch (error) {
            res.status(404).send('car not found')
            return
        }

        try {
            await CarWatched.remove(carWatched)
        } catch (error) {
            res.status(400).send('bad request')
            return
        }

        res.status(200).send('car deleted')
    }
}

export default CarWatchedController
