const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;

const ForumSchema = new Schema({
  title: String,
  contents: String,
  date: String,
  img: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

ForumSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      // remove를 사용해도 되지만 deleteOne이나 deleteMany를 사용하라는 경고창이 뜬다
      _id: {
        $in: doc.comments,
      },
    });
  }
});
// Forum이 findOneAndDelete에 해당하는 post요청을 받을 때, doc.comments에 접근하여 해당 게시물에 작성된 댓글들까지 모두 삭제하는 미들웨어

module.exports = mongoose.model("Forum", ForumSchema);
