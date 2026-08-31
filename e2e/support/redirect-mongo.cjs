const Module = require("node:module");

const targetUri = process.env.JSBACKEND_E2E_MONGODB_URI;
if (!targetUri) {
  throw new Error(
    "JSBACKEND_E2E_MONGODB_URI is required by the MongoDB E2E preload"
  );
}

const parsed = new URL(targetUri);
if (
  parsed.protocol !== "mongodb:" ||
  !["127.0.0.1", "localhost"].includes(parsed.hostname)
) {
  throw new Error("MongoDB E2E preload only permits a local MongoDB target");
}

const originalLoad = Module._load;
const patched = new WeakSet();

Module._load = function redirectMongo(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain);

  if (request === "mongodb" && !patched.has(loaded)) {
    const ActualMongoClient = loaded.MongoClient;
    class LocalMongoClient extends ActualMongoClient {
      constructor(_uri, ...args) {
        super(targetUri, ...args);
      }

      static connect(_uri, ...args) {
        return ActualMongoClient.connect(targetUri, ...args);
      }
    }
    Object.defineProperty(loaded, "MongoClient", {
      configurable: true,
      enumerable: true,
      value: LocalMongoClient,
      writable: true,
    });
    patched.add(loaded);
  }

  if (request === "mongoose" && !patched.has(loaded)) {
    const connect = loaded.connect.bind(loaded);
    const createConnection = loaded.createConnection.bind(loaded);
    loaded.connect = (_uri, ...args) => connect(targetUri, ...args);
    loaded.createConnection = (_uri, ...args) =>
      createConnection(targetUri, ...args);
    patched.add(loaded);
  }

  return loaded;
};
