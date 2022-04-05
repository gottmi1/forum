const express = require("express");
const router = express.Router();

const { forumSchema } = require("../schemas.js");

const Forum = require("../models/forum");
const Comment = require("../models/comment");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const validateForum = (req, res, next) => {
  const { error } = forumSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    // error.details 에 있는 모든 항목을 출력함 .join은 에러가 여러개일 경우 ,로 구분해주는 역할
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get("/", async (req, res) => {
  const forums = await Forum.find({});
  //findbyId등은 구조상 비동기만 사용할 수 있기 때문에 async,await을 사용해 준다
  res.render("forums/index", { forums });
  // res.render의 두번째 인수로 {abcd}를 해주면 해당 ejs에서 abcd객체 내부에 접근할 수 있다. 이렇게 접근하면 <%= abcd.title %>등으로 사용할 수 있음
});

router.get("/new", (req, res) => {
  res.render("forums/new");
});
// /:id 아래에 /abcd.. 이런 게 있으면 그 문자를 id로 처리하기 때문에 위로 놓아야 함

router.post(
  "/",
  validateForum,
  catchAsync(async (req, res, next) => {
    const forum = new Forum(req.body.forum);
    await forum.save();
    req.flash("success", "게시물이 작성되었습니다.");
    res.redirect(`/forums/${forum._id}`);
  })
);
// post요청을 받았을 때 실행됨

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const forums = await Forum.findById(req.params.id).populate("comments");
    // .populate부턴 댓글을 추가하기 위해서 보강한 부분임
    if (!forums) {
      req.flash("del", "게시물을 찾을 수 없습니다.");
      return res.redirect("/forums");
    }
    // 존재하지 않는 글에 접근하였을 때
    res.render("forums/show", { forums });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const forums = await Forum.findById(req.params.id);
    if (!forums) {
      req.flash("del", "게시물을 찾을 수 없습니다.");
      return res.redirect("/forums");
    }
    // 존재하지 않는 글에 접근하였을 때
    res.render("forums/edit", { forums });
  })
);

router.put(
  "/:id",
  validateForum,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const forums = await Forum.findByIdAndUpdate(id, { ...req.body.forum });
    // 두번쨰 인수는 업데이트할 실제 쿼리. 안에 있는 내용을 전부 가져와야해서 ...을 사용함?
    req.flash("update", "게시물이 업데이트 되었습니다.");
    res.redirect(`/forums/${forums._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const forums = await Forum.findByIdAndDelete(id);
    req.flash("del", "게시물이 삭제되었습니다.");
    res.redirect("/forums");
  })
);

module.exports = router;
