const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
UserSchema.plugin(passportLocalMongoose);
// UserShcema에 사용자명,암호필드를 추가하고 중복되는 사용자명이 있는짛 확인하고 부가적인 몇개의 메서드를 추가한다. p-l-m에 helper메서드로 내장된 register 메서드를 이용해 주어진 암호로 새로운 사용자 인스턴스를 등록한다(중복 여부도 확인함)
// passport로 해싱할 땐 pbkdf2 라는 해싱알고리즘을 사용한다

module.exports = mongoose.model("User", UserSchema);

// passport를 사용하여 유저의 model을 정함
