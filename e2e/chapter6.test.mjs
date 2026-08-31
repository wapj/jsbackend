import assert from "node:assert/strict";
import test from "node:test";
import {
  chapterPath,
  jsonRequest,
  mongoEnv,
  runNode,
  startNode,
  waitForHttp,
} from "./support/process.mjs";

test("chapter6: native MongoDB and Mongoose CRUD use a disposable database", async (t) => {
  const env = mongoEnv();
  const nativeCwd = chapterPath("chapter6", "try-mongo");
  await runNode("test-connection.js", [], { cwd: nativeCwd, env });
  await runNode("mongo-crud.js", [], { cwd: nativeCwd, env });
  await runNode("test-crud.js", [], { cwd: nativeCwd, env });

  const mongooseCwd = chapterPath("chapter6", "test-mongoose");
  const server = startNode("mongoose-crud.js", [], { cwd: mongooseCwd, env });
  t.after(() => server.stop());
  await waitForHttp("http://127.0.0.1:3000/person");

  const email = "chapter6-e2e@example.com";
  const created = await jsonRequest(
    "http://127.0.0.1:3000/person",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "chapter6", age: 24, email }),
    },
    200
  );
  assert.equal(created.email, email);

  const fetched = await jsonRequest(
    `http://127.0.0.1:3000/person/${encodeURIComponent(email)}`
  );
  assert.equal(fetched.name, "chapter6");

  const updated = await jsonRequest(
    `http://127.0.0.1:3000/person/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "chapter6-updated" }),
    }
  );
  assert.equal(updated.name, "chapter6-updated");

  assert.deepEqual(
    await jsonRequest(
      `http://127.0.0.1:3000/person/${encodeURIComponent(email)}`,
      { method: "DELETE" }
    ),
    { success: true }
  );
});
