const { Router } = require('express');
const AuthMiddleware = require('../middlewares/checkAuth');
const QuestionController = require('../controllers/QuestionController').default;

const router = Router();

router.get(
  '/:carId',
  QuestionController.getQuestionsByCarId
);

router.post(
  '/:carId',
  [AuthMiddleware],
  QuestionController.addQuestion
)

router.post(
  '/:carId/:questionId/like',
  [AuthMiddleware],
  QuestionController.setUpvoted
)

router.post(
  '/:carId/:questionId/inappropriate',
  [AuthMiddleware],
  QuestionController.setInappropriate
)

router.post(
  '/:carId/:questionId',
  [AuthMiddleware],
  QuestionController.setAnswer
)

router.put(
  '/:carId/:questionId/edit',
  [AuthMiddleware],
  QuestionController.setAnswer
)

router.put(
  '/:carId/:questionId/edit',
  [AuthMiddleware],
  QuestionController.editQuestion
)

module.exports = router
