const express = require("express");
const router = express.Router();

const { isLoggedIn, isAuthor, validateForum } = require("../middleware");

const forumControl = require("../controllers/forums");

const catchAsync = require("../utils/catchAsync");

// 코드가 길어져서 mvc패턴을 사용해 내용을 controllers로 옮겨주었다.

//router.route 를 사용하면 같은 경로에 보내는 get,post,put등 모든 요청을 이어서 쓸 수 있다

router
  .route("/")
  .get(catchAsync(forumControl.index))
  .post(isLoggedIn, validateForum, catchAsync(forumControl.createNewForum));
// post요청을 받았을 때 실행됨

router.get("/new", isLoggedIn, forumControl.renderNewForum);
// /:id 아래에 /abcd..같은 경로가 있으면 그 문자를 id로 인식하기 때문에 /:id 를 최하단에 놓고 그 위로 놓아야 함

router
  .route("/:id")
  .get(catchAsync(forumControl.showForum))
  .put(
    isLoggedIn,
    isAuthor,
    validateForum,
    catchAsync(forumControl.updateForum)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(forumControl.deleteForum));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(forumControl.renderEditForum)
);

module.exports = router;
