class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
// 오류 메세지,코드를 내가 정할 수 있게 해준다. catchAsync가 사용된 요청에 쓴다
