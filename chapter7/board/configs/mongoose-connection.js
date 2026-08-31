const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/board";

module.exports = function () {
  return mongoose.connect(uri, { useNewUrlParser: true });
};
