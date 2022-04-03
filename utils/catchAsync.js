module.exports = (func) => {
  // 위의 func는 전달하는 것
  return (req, res, next) => {
    func(req, res, next).catch(next);
    // 이건 실행되는 func를 가진 새로운 함수를 반환 후 오류를 검출하고 다음으로 전달함
  };
};

// 에러가 있을 때, 다음으로 전달해줘서 서버가 터지지않고 에러메세지가 뜨게 만드는 함수
