const Forum = require("./models/forum");
const Comment = require("./models/comment");
const { forumSchema, commentSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.user); 현재 로그인 된 정보
  if (!req.isAuthenticated()) {
    // console.log(req.path, req.originalUrl); 필요한 정보
    req.session.returnTo = req.originalUrl;
    // req.session에 returnTo라는 항목을 추가함. 인증된 사용자가 아닐 경우, 요청한 url을 보관하고 인증 된 후 다시 돌려주는 동작
    req.flash("del", "로그인 후 작성 가능합니다.");
    return res.redirect("/login");
  }
  next();
  // 인증된 상태일 경우를 대비함
};
// 로그인 되지 않은 사용자가 접근했을 때 사용되는 미들웨어, get,post에 모두 적용하여 접근을 막는다

module.exports.validateForum = (req, res, next) => {
  const { error } = forumSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    // error.details 에 있는 모든 항목을 출력함 .join은 에러가 여러개일 경우 ,로 구분해주는 역할
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const forums = await Forum.findById(id);
  if (!forums.author.equals(req.user._id)) {
    req.flash("del", "권한이 없습니다.");
    return res.redirect(`/forums/${forums._id}`);
  }
  next();
};
// 업데이트나 삭제할 때 find와 동시에하면 권한이 있는지 확인할 시간을 주지않기 때문에 findByIdUpdate,Delete 전에 나눠서 동작시킨다
module.exports.isCommentAuthor = async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment.author.equals(req.user._id)) {
    req.flash("del", "권한이 없습니다.");
    return res.redirect(`/forums/${id}`);
  }
  next();
};
