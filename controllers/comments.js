const Comment = require("../models/comment");
const Forum = require("../models/forum");

module.exports.createComment = async (req, res) => {
  const { id } = req.params;
  const forums = await Forum.findById(id);
  const comment = new Comment(req.body.comment);
  console.log(comment);
  // author에 = req.user._id하기 전
  // { body: 'dd', _id: new ObjectId("62506db45389adc056434e00") }
  comment.author = req.user._id;
  // 한 후. 정보가 추가되었다
  // {
  //   body: 'dd',
  //   _id: new ObjectId("62506db45389adc056434e00"),
  //   author: new ObjectId("624ddfc7ba8b051acc07b474")
  // }
  console.log(comment);
  forums.comments.push(comment);
  await comment.save();
  await forums.save();
  req.flash("success", "댓글이 성공적으로 작성되었습니다.");
  res.redirect(`/forums/${forums._id}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const forums = await Forum.findByIdAndUpdate(id, {
    $pull: { comments: commentId },
  });
  // Mongo에서 사용하는 배열 수정연산자인 $pull(배열에 있는 인스턴스 중 특정조건을 만족하는 값을 지움)를 사용한다. 가져온 commentId와 일치하는 리뷰를 꺼는데 여기서 comments는 배열이고 거기서 값을 꺼내는 거임 리뷰 배열에서 해당 리뷰의 참조를 삭제하고 그 다음 리뷰 자체를 삭제
  const comment = await Comment.findByIdAndDelete(commentId);
  req.flash("del", "댓글이 삭제되었습니다.");
  res.redirect(`/forums/${id}`);
};
