const { Router } = require('express');
const AuthMiddleware = require('../middlewares/checkAuth');
const UserNotificationController = require('../controllers/UserNotificationController').default;

const router = Router();

router.get(
  '/',
  [AuthMiddleware],
  UserNotificationController.getNotifications
);

router.post(
  '/:notificationId',
  [AuthMiddleware],
  UserNotificationController.markNotificationReaded
);

module.exports = router
