const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/test";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const adminDB = client.db('test').admin();
  const listDatabases = await adminDB.listDatabases();
  console.log(listDatabases);
  return "OK";
}

run()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
