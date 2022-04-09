const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
// index는 입력하지 않아도 된다 폴더에서 index를 자동으로 찾기 때문
const upload = multer({ storage });
// 실제로 업로드할 경로를 정해준다.

const { isLoggedIn, isAuthor, validateForum } = require("../middleware");

const forumControl = require("../controllers/forums");

const catchAsync = require("../utils/catchAsync");

// 코드가 길어져서 mvc패턴을 사용해 내용을 controllers로 옮겨주었다.

//router.route 를 사용하면 같은 경로에 보내는 get,post,put등 모든 요청을 이어서 쓸 수 있다

router
  .route("/")
  .get(catchAsync(forumControl.index))
  // .post(isLoggedIn, validateForum, catchAsync(forumControl.createNewForum));
  .post(upload.single("forum[img]"), (req, res) => {
    //upload.single은 단일 파일만 업로드 할 수 있고 upload.array는 여러개의 파일을 업로드할 수 있다. 이 때 업로드 하려는 file input에 multipie속성을 줘야 함 req.fils은 single용 req.files는 array용임
    res.send(req.file);
  });
// multer를 사용하기 전 결과 값 {}
// multer를 사용한 후 결과 값 {"forum":{"title":"gdg","date":"2022. 4. 9. 오후 9:50:24","contents":"sdg"}}
// multer를 사용한 후의 req.file
// {"fieldname":"forum[img]","originalname":"toggle.PNG","encoding":"7bit","mimetype":"image/png","destination":"uploads/","filename":"a4a7e5e3f35d505e7fda9fc5a22924e8","path":"uploads\\a4a7e5e3f35d505e7fda9fc5a22924e8","size":36080}
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
