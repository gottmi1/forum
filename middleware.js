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
