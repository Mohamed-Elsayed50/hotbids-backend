const { Router } = require('express');
const AuthMiddleware = require('../middlewares/checkAuth');
const CommentController = require('../controllers/CommentController').default;

const router = Router();

router.get(
  '/:carId',
  CommentController.getCommentsByCarId
);

router.get(
  '/by-user/:username',
  CommentController.getUserComments
);

router.post(
  '/:carId',
  [AuthMiddleware],
  CommentController.addComment
)

router.post(
  '/:carId/:commentId/like',
  [AuthMiddleware],
  CommentController.setUpvoted
)

router.post(
  '/:carId/:commentId/inappropriate',
  [AuthMiddleware],
  CommentController.setInappropriate
)

router.put(
  '/:carId/:commentId/edit',
  [AuthMiddleware],
  CommentController.editComment
)

module.exports = router
