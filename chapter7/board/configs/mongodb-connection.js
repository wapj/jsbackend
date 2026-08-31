const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/board";

module.exports = function (callback) {
  return MongoClient.connect(uri, callback);
};
