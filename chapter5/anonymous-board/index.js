const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://mymongo:test1234@cluster0.c4xru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect(async (err) => {
  const adminConnection = client.db("test").admin();
  await adminConnection.listDatabases((err, db) => {
    if (!err) console.log(db);
  });
  client.close();
});
