const express = require("express");
const router = express.Router();

const { isLoggedIn, isAuthor, validateForum } = require("../middleware");

const Forum = require("../models/forum");
const Comment = require("../models/comment");

const catchAsync = require("../utils/catchAsync");

router.get("/", async (req, res) => {
  const forums = await Forum.find({}).populate("author");
  //findbyId등은 구조상 비동기만 사용할 수 있기 때문에 async,await을 사용해 준다
  res.render("forums/index", { forums });
  console.log(forums);
  // res.render의 두번째 인수로 {abcd}를 해주면 해당 ejs에서 abcd객체 내부에 접근할 수 있다. 이렇게 접근하면 <%= abcd.title %>등으로 사용할 수 있음
});

router.get("/new", isLoggedIn, (req, res) => {
  res.render("forums/new");
});
// /:id 아래에 /abcd.. 이런 게 있으면 그 문자를 id로 처리하기 때문에 위로 놓아야 함

router.post(
  "/",
  isLoggedIn,
  validateForum,
  catchAsync(async (req, res, next) => {
    const forum = new Forum(req.body.forum);
    forum.author = req.user._id;
    await forum.save();
    req.flash("success", "게시물이 작성되었습니다.");
    res.redirect(`/forums/${forum._id}`);
  })
);
// post요청을 받았을 때 실행됨

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const forums = await await Forum.findById(req.params.id)
      .populate({
        path: "comments",
        populate: {
          path: "author",
        },
      })
      // 찾는 글의 댓글 배열에 있는 모든 댓글을 forum.comments에 채워넣으라는 코드. commnet의 username도 추적해서 접근할 수 있어진다.
      .populate("author");
    console.log(forums);
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
  isLoggedIn,
  isAuthor,
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
  isLoggedIn,
  isAuthor,
  validateForum,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // const forums = await Forum.findById(id);
    // if (!forums.author.equals(req.user._id)) {
    //   req.flash("del", "권한이 없습니다.");
    //   res.redirect(`/forums/${forums._id}`);
    // } 미들웨어로 쓰기 때문에 지워줌
    // const forums = await Forum.findByIdAndUpdate(id, { ...req.body.forum });
    const forums = await Forum.findByIdAndUpdate(id, { ...req.body.forum });
    // 두번쨰 인수는 업데이트할 실제 쿼리. 안에 있는 내용을 전부 가져와야해서 ...을 사용하는듯?
    req.flash("update", "게시물이 업데이트 되었습니다.");
    res.redirect(`/forums/${forums._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const forum = await Forum.findByIdAndDelete(id);
    req.flash("del", "게시물이 삭제되었습니다.");
    res.redirect("/forums");
  })
);

module.exports = router;
