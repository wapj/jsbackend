const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://mymongo:test1234@cluster0.c4xru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

async function run() {
  try {
    await client.connect();
    const collection = client.db("board").collection("users");
    // Create
    const result = await collection.insertOne({ name: 'John', email: 'john@example.com' });
    console.log(result.insertedId);
    // Read
    const documents = await collection.find().toArray();
    console.log(documents);
    // Update
    const updateResult = await collection.updateOne({ name: 'John' }, { $set: { name: 'Mike' } });
    console.log(updateResult.modifiedCount);
    // Delete
    const deleteResult = await collection.deleteOne({ name: 'Mike' });
    console.log(deleteResult.deletedCount);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();