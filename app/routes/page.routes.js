const { Router } = require('express');
const PageController = require('../controllers/PageController').default;

const router = Router();

router.get(
  '/by-id/:id',
  PageController.getPageById
);

router.get(
  '/:url',
  PageController.getPageByUrl
);

module.exports = router
