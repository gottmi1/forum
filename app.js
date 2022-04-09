if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// process.env.NODE_ENV = 환경변수
// 코드에 쓰이는 값을 git에 업로드하거나 할 때 공개하고 싶지 않을 때 .env를 사용하는 것 같다 예를들어 API KEY같은 것들
console.log(process.env.CLOUDINARY_KEY);
// 이렇게 .env내부에 있는 키,값에 접근할 수가 있다
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const forumRouter = require("./routes/forums");
const commentRouter = require("./routes/comments");
const userRouter = require("./routes/users");

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
app.use(express.static(path.join(__dirname, "public")));
// public폴더 안에 있는 파일들을 꺼내올 때 경로를 따로 설정할 필요없이 /item으로 바로 불러올 수 있게 함
const sessionConfig = {
  secret: "abcd",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    // 만료 기한 설정 Date.now는 밀리초 단위를 반환하기 때문에 일주일 후 만료를 설정하려면 이렇게 하면 됨 만료 기한이 없으면 쿠키를 지우기 전까지 평생 유지된다
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httponly: true,
    // 기본으로 설정돼 있긴 하지만 httpOnly 항목에 체크마크를 넣어줌(클라이언트 측 스크립트에서 해당 쿠키에 접근할 수 없고 xss에 결함이 있거나 사용자가 결함을 일으키는 링크에 접근할 시 브라우저가 제 3자에게 쿠키를 유출하지 않도록한다고 함..) 그냥 추가할 수 있는 간단한 보안코드
  },
};
app.use(session(sessionConfig));
// 개발자도구 -> 어플리케이션 -> 쿠키에 connect.sid를 생성하기 위함
app.use(flash());
// req.flash에 키,값 쌍을 전달해 플래시를 생성한다 템플릿에 값을 전달하지 않도록 미들웨어를 사용함
app.use(passport.initialize());
app.use(passport.session());
// passport.session은 app.use session아래에 있어야함

passport.use(new LocalStrategy(User.authenticate()));
// localStarategy를 사용하라고 명령하는 코드.

// 아래 두 헬퍼메서드는 세션을 이용하여 고유의 정보를 저장함
passport.serializeUser(User.serializeUser());
// passport에게 사용자를 어떻게 직렬화하는지 알려주고, 직렬화는 어떻게 데이터를 얻고 세션에서 사용자를 저장하는지를 참조한다
passport.deserializeUser(User.deserializeUser());
// models/user의 12번 줄에 작성된 플러그인(passport-local-mongoose) 덕분에 이 두개의 메서드를 사용할 수가 있다
// 갇단하게 위 두 줄은 세션에서 저장할지, 저장하지 않을지 지정한다

app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user;
  // 로그인 되어있는지 안되어있는지. 로그인이 안 되어 있으면 undefined반환함
  res.locals.success = req.flash("success");
  res.locals.del = req.flash("del");
  res.locals.update = req.flash("update");
  next();
  //next가 반드시 필요함
});
// 키값이 success인 플래시를 가져와 로컬 변수(뒤 success)에 접근
// app.use로 모든 요청에 응답하기 때문에 어느 요청이든 보여야 할만한 것들을 모아둔다

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", userRouter);
// user 라우트

app.use("/forums", forumRouter);
// forums 라우트

app.use("/forums/:id/comments", commentRouter);
// comment 라우트

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
