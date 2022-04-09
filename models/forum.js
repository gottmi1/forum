const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;

const imgSchema = new Schema({
  url: String,
  filename: String,
});
imgSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_150");
  // /upload를 /upload/w_300으로 대체해 width 150의 이미지로 바꾼다
});
// 가상특성을 추가하기 위해 imgs의 내부를 따로 스키마로 만듬(가상 특성은 스키마 단위에만 추가할 수 있음)
// virtual을 사용한 이유는 저장된 정보를 토대로 만들어지기 때문에 새로 모델이나 데이터베이스에 따로 저장할 필요가 없어서
// thumbnail을 호출할 때 마다 이 코드가 실행된다

const ForumSchema = new Schema({
  title: String,
  contents: String,
  date: String,
  imgs: [imgSchema],
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
