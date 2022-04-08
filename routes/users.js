const express = require("express");
const router = express.Router();
const User = require("../models/user");

const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const userControl = require("../controllers/users");

router
  .route("/register")
  .get(userControl.renderRegisterForm)
  .post(catchAsync(userControl.register));

router
  .route("/login")
  .get(userControl.renderLoginForm)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      successFlash: "로그인 되었습니다.",
    }),
    userControl.login
    // 사실 로그인 기능은 passport의 기능이고 userControl.login이 하는 일은 returnTo와 리다이렉트임..
  );

router.get("/logout", userControl.logout);

module.exports = router;
