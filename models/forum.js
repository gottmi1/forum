const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ForumSchema = new Schema({
  title: String,
  author: String,
  contents: String,
  date: String,
  img: String,
});

module.exports = mongoose.model("Forum", ForumSchema);
