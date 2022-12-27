const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://<user>:<password>@<atlashost>/board";

module.exports = function (callback) {
  return MongoClient.connect(uri, callback);
};
