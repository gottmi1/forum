const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const { forumSchema } = require("./schemas.js");

const Forum = require("./models/forum");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

main()
  .then(() => {
    console.log("localhost:27017 database conneted");
  })
  .catch((err) => {
    console.log("localhost:27017 NO CONNECT");
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://localhost:27017/forum");
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// view엔진을 ejs로  설정하면 ejs파일을 알아서 찾기 때문에 경로에 .ejs를 붙여줄 필요가 없다
app.set("views", path.join(__dirname, "views"));
// res.render("..")에 들어갈 ejs파일 앞에 경로를 설정해주는 작업
// path.join은 nodemon,node를 실행한 위치가 아니라 app.js가 있는 디렉토리에서 경로를 찾을 수 있게 해줌

app.use(express.urlencoded({ extended: true }));
// req.body같은 걸 parse해 주는 역할
app.use(methodOverride("_method"));

const validateForum = (req, res, next) => {
  const { error } = forumSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/forums", async (req, res) => {
  const forums = await Forum.find({});
  //findbyId등은 구조상 비동기만 사용할 수 있기 때문에 async,await을 사용해 준다
  res.render("forums/index", { forums });
  // res.render의 두번째 인수로 {abcd}를 해주면 해당 ejs에서 abcd객체 내부에 접근할 수 있다. 이렇게 접근하면 <%= abcd.title %>등으로 사용할 수 있음
});

app.get("/forums/new", (req, res) => {
  res.render("forums/new");
});
// /:id 아래에 /abcd.. 이런 게 있으면 그 문자를 id로 처리하기 때문에 위로 놓아야 함

app.post(
  "/forums",
  validateForum,
  catchAsync(async (req, res, next) => {
    const forum = new Forum(req.body.forum);
    await forum.save();
    res.redirect(`/forums/${forum._id}`);
  })
);
// post요청을 받았을 때 실행됨

app.get(
  "/forums/:id",
  catchAsync(async (req, res) => {
    const forums = await Forum.findById(req.params.id);
    res.render("forums/show", { forums });
  })
);

app.get(
  "/forums/:id/edit",
  catchAsync(async (req, res) => {
    const forums = await Forum.findById(req.params.id);
    res.render("forums/edit", { forums });
  })
);

app.put(
  "/forums/:id",
  validateForum,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const forums = await Forum.findByIdAndUpdate(id, { ...req.body.forum });
    // 두번쨰 인수는 업데이트할 실제 쿼리. 안에 있는 내용을 전부 가져와야해서 ...을 사용함?
    res.redirect(`/forums/${forums._id}`);
  })
);

app.delete(
  "/forums/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const forums = await Forum.findByIdAndDelete(id);
    res.redirect("/forums");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("페이지를 찾을 수 없습니다", 404));
});
// app.all은 모든 요청에대해 응답하는데 아래에 놓을 경우 상단에 있는 모든 코드에 요청이 전해지지 않았을 때만 실행된다(따로 작성하지 않은 에러는 얘가 사용됨)

// 위에서 받은 에러를 next해서 아래 err로 받아준다
app.use((err, req, res, next) => {
  const { statusCode = "500" } = err;
  if (!err.message) err.message = "에러가 발생했습니다.";
  res.status(statusCode).render("error", { err });
});
// 오류를 만들고 싶은 곳 어디서든 new ExpressError를 작성해서 next로 전달해주면 스테이터스 코드를 정해줄 수 있다

app.listen(3000, () => {
  console.log("3000번 포트에서 서빙중");
});
