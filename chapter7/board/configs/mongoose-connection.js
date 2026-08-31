const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const uri =
  "mongodb+srv://<user>:<password>@<atlashost>/board?retryWrites=true&w=majority";

module.exports = function () {
  return mongoose.connect(uri, { useNewUrlParser: true });
};
