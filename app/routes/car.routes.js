const { Router } = require('express')
const upload = require('multer')({ dest: 'uploads-tmp/' })
const AuthMiddleware = require('../middlewares/checkAuth')
const AllowAdminPanelMiddleware = require('../middlewares/allowAdminPanel')
const CarController = require('../controllers/CarController').default
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const timeout = require('connect-timeout')
const router = Router()

const postCarImagesUpload = upload.fields([
    { name: 'carImagesExterior', maxCount: 100 },
    { name: 'carImagesInterior', maxCount: 100 },
    { name: 'carImagesMechanical', maxCount: 100 },
    { name: 'carImagesDocs', maxCount: 100 },
    { name: 'carImagesOther', maxCount: 100 }
])

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next()
}

router.get(
    '/',
    haltOnTimedout,
    CarController.getCars
)

router.get(
    '/by-id/:carId',
    CarController.getCar
)

router.get(
    '/by-user/:username',
    CarController.getAuctionedCars
)

router.get(
    '/user',
    [AuthMiddleware],
    CarController.getUserCars
)

router.get(
    '/check-user',
    [AuthMiddleware],
    CarController.checkIfSellsForFirstTime
)

router.post(
    '/add-joined-car-photo/',
    [AuthMiddleware, postCarImagesUpload],
    CarController.postCarPhoto
)

router.post(
    '/',
    [AuthMiddleware, postCarImagesUpload],
    CarController.postCar
)

router.post(
    '/set-scheduling/:carId',
    [AuthMiddleware, upload.fields([])],
    CarController.setCarScheduling
)

router.post(
    '/pay-place-car-fee/:carId',
    [AuthMiddleware],
    CarController.payPlaceCarFee
)

router.delete(
    '/delete-car-photo/:imageId',
    [AuthMiddleware],
    CarController.removeCarPhoto
)

router.put(
    '/:carId',
    [
        AuthMiddleware,
        AllowAdminPanelMiddleware,
        postCarImagesUpload
    ],
    CarController.putCar
)

router.get(
    '/set-state/:carId',
    [
        AuthMiddleware,
        AllowAdminPanelMiddleware
    ],
    CarController.setState
)

module.exports = router
