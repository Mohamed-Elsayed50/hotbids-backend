const {Router} = require('express')
const AuthMiddleware = require('../middlewares/checkAuth')
const CarWatchedController = require('../controllers/CarWatchedController').default

const router = Router()

router.get(
    '/',
    [AuthMiddleware],
    CarWatchedController.getWatchedCars
)

router.post(
    '/:carId',
    [AuthMiddleware],
    CarWatchedController.addCarToWatched
)

router.delete(
    '/:carId',
    [AuthMiddleware],
    CarWatchedController.deleteWatchedCar
)


module.exports = router
