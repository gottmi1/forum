const Joi = require("joi");

module.exports.forumSchema = Joi.object({
  forum: Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required().min(2),
    contents: Joi.string().required(),
    img: Joi.string(),
    date: Joi.string(),
  }).required(),
});
