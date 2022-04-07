const express = require("express");
const router = express.Router();
const User = require("../models/user");

const catchAsync = require("../utils/catchAsync");

const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({
        email,
        username,
      });
      // user의 정보에는 email,username만 담고 password는 따로 해싱해줘야 함
      const registerUser = await User.register(user, password);
      // 여기서 register가 password를 해싱해주고, user의 정보가 현재 db의 정보와 중복되는지 검사하고 db에 저장까지 해줌
      req.login(registerUser, (err) => {
        if (err) return next();
        req.flash("success", "회원가입이 완료되었습니다.");
        res.redirect("/forums");
      });
      //회원가입 후 따로 로그인 할 필요 없이 로그인상태가 유지되도록 특이사항으로 콜백이 있음
    } catch (e) {
      req.flash("del", "사용자명 혹은 이메일이 중복됩니다.");
      res.redirect("/register");
    } // 만약 사용자명이나 이메일이 중복되는 등 에러페이지로 리다이렉트 되는 상황을 대비하여 에러가 있는 경우엔 flash를 띄우고 다시 해당 페이지로 리다이렉트 해줌
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successFlash: "로그인 되었습니다.",
  }),
  (req, res) => {
    const redirectUrl = req.session.returnTo || "/forums";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  // passport의 헬퍼 메서드로, 간단하게 로그아웃 시켜줌
  req.flash("success", "로그아웃 되었습니다.");
  res.redirect("/forums");
});

module.exports = router;
