const Joi = require("joi");

module.exports.forumSchema = Joi.object({
  forum: Joi.object({
    title: Joi.string().required(),
    contents: Joi.string().required(),
    // img: Joi.string(),
    date: Joi.string(),
  }).required(),
  deleteImg: Joi.array(),
});

module.exports.commentSchema = Joi.object({
  comment: Joi.object({
    body: Joi.string().required(),
  }).required(),
});

// db에 저장하기 전 유효성 검사실행
