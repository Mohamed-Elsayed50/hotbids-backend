const {Router} = require('express')
const AuthMiddleware = require('../middlewares/checkAuth')
const BidController = require('../controllers/BidController').default

const router = Router()

router.get(
    '/:carId',
    BidController.getCarBids
)

router.get(
    '/by-user/:username',
    BidController.getUserBidHistory
)

router.post(
    '/:carId',
    [AuthMiddleware],
    BidController.putBidToCar
)

module.exports = router
