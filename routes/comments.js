const express = require("express");
const router = express.Router({ mergeParams: true });
// mergeParams: true를 해야 라우터의 경로에 포함된 ../:id 를 가져올 수 있음(안하면 {}로 빈 객체가 뜬다) 라우터를 사용할 때 중요하니까 기억

const { commentSchema } = require("../schemas.js");

const Forum = require("../models/forum");
const Comment = require("../models/comment");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateComment,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const forums = await Forum.findById(id);
    const comment = new Comment(req.body.comment);
    forums.comments.push(comment);
    await comment.save();
    await forums.save();
    req.flash("success", "댓글이 성공적으로 작성되었습니다.");
    res.redirect(`/forums/${forums._id}`);
  })
);
router.delete(
  "/:commentId",
  catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    const forums = await Forum.findByIdAndUpdate(id, {
      $pull: { comments: commentId },
    });
    // Mongo에서 사용하는 배열 수정연산자인 $pull(배열에 있는 인스턴스 중 특정조건을 만족하는 값을 지움)를 사용한다. 가져온 commentId와 일치하는 리뷰를 꺼는데 여기서 comments는 배열이고 거기서 값을 꺼내는 거임 리뷰 배열에서 해당 리뷰의 참조를 삭제하고 그 다음 리뷰 자체를 삭제
    const comment = await Comment.findByIdAndDelete(commentId);
    req.flash("del", "댓글이 삭제되었습니다.");
    res.redirect(`/forums/${id}`);
  })
);
// Forum에 접근하여 해당하는 commentId를 가진 댓글만 지우고 싶음

module.exports = router;
