const { Router } = require('express')
const AuthMiddleware = require('../middlewares/checkAuth')
const SupportController = require('../controllers/SupportController').default
const upload = require('multer')({
    limits: {
        fieldSize: 10 * 1024 * 1024
    }
})

const router = Router()

router.post(
    '/get-token',
    [AuthMiddleware],
    SupportController.getToken
)

router.post(
    '/post-on-message-added',
    SupportController.onMessageAdded
)

router.post(
    '/notify-user',
    SupportController.notifyAboutManagerAnswer
)

router.post(
    '/post-on-email-sended',
    [upload.any()],
    SupportController.onEmailAnswer
)

module.exports = router
