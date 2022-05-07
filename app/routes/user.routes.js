const { Router } = require('express')
const UserController = require('../controllers/UserController').default
const checkAuth = require("../middlewares/checkAuth")
const allowAdminChangeUser = require("../middlewares/allowAdminChangeUser")
const upload = require('multer')({ dest: 'uploads-tmp/' })

const router = Router()

router.get(
    '/',
    checkAuth,
    UserController.getUser
)

router.get(
    '/by-username/:username',
    UserController.getUserOverviewInfo
)

router.get(
    '/resend-verification',
    UserController.resendVerificationUser
)

router.post(
    '/avatar',
    [
        checkAuth,
        allowAdminChangeUser
    ],
    UserController.getUsersAvatar
)

router.post(
    '/',
    UserController.postUser
)

router.post(
    '/verify',
    UserController.verifyUser
)

router.post(
    '/password-recovery/send',
    UserController.passwordRecoverySend
)

router.post(
    '/password-recovery/check',
    UserController.passwordRecoveryCheck
)

router.post(
    '/password-recovery/update-password',
    UserController.passwordRecoveryUpdatePassword
)

router.post(
    '/login',
    UserController.login
)

router.post(
    '/change-password',
    checkAuth,
    UserController.changePassword
)

router.post(
    '/save-payment',
    checkAuth,
    UserController.saveUserPaymentCard
)

router.post(
    '/subscribe',
    UserController.subscribeUser
)

const postUserAvatarUpload = upload.fields([
    { name: 'avatar', maxCount: 1 }
])
router.post(
    '/upload-avatar',
    [
        checkAuth,
        allowAdminChangeUser,
        postUserAvatarUpload
    ],
    UserController.uploadAvatar
)

router.put(
    '/',
    [
        checkAuth,
        allowAdminChangeUser
    ],
    UserController.putUser
)

router.put(
    '/update-payment',
    checkAuth,
    UserController.updateUserPaymentCard
)

module.exports = router
