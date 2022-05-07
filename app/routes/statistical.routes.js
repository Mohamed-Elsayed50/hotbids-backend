const { Router } = require('express');
const allowAdminPanelMiddleware = require('../middlewares/allowAdminPanel')
const checkAuthMiddleware = require('../middlewares/checkAuth')
const StatisticalController = require('../controllers/StatisticalController').default;

const router = Router();

router.get(
  '/metrics',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getMetrics
)

router.get(
  '/charts',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getChartsData
)

router.get(
  '/users',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getUsers
)

router.get(
  '/cars',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getCars
)

router.get(
  '/auctions',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getAuctions
)

router.get(
  '/sales',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getSalesRevenue
)

router.get(
  '/managers',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getManagers
)

router.get(
  '/history',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getManagerHistory
)

router.get(
  '/comments',
  [
    checkAuthMiddleware,
    allowAdminPanelMiddleware
  ],
  StatisticalController.getCommets
)
module.exports = router
