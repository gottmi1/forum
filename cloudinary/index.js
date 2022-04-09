const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "forum", allowedFormats: ["jpeg", "png", "jpg"] },
  // 업로드 가능한 확장자를 정해준다
});
// exports해야하기 때문에 변수로 저장

module.exports = {
  cloudinary,
  storage,
};
