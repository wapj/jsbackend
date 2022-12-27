const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://<username>:<password>@<atlas-host>/board";
// const uri = "mongodb://localhost:27017";

module.exports = function (callback) {
  return MongoClient.connect(uri, callback);
};
