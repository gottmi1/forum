const express = require("express");
const router = express.Router({ mergeParams: true });
// mergeParams: true를 해야 라우터의 경로에 포함된 ../:id 를 가져올 수 있음(안하면 {}로 빈 객체가 뜬다) 라우터를 사용할 때 중요하니까 기억
const commentControl = require("../controllers/comments");

const {
  isLoggedIn,
  validateComment,
  isCommentAuthor,
} = require("../middleware");

const catchAsync = require("../utils/catchAsync");

router.post(
  "/",
  isLoggedIn,
  validateComment,
  catchAsync(commentControl.createComment)
);

router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  catchAsync(commentControl.deleteComment)
);
// Forum에 접근하여 해당하는 commentId를 가진 댓글만 지우고 싶음

module.exports = router;
