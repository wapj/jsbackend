import assert from "node:assert/strict";
import test from "node:test";
import {
  chapterPath,
  eventually,
  jsonRequest,
  mongoEnv,
  startNode,
  waitForOutput,
} from "./support/process.mjs";

async function exerciseBoard(t, directory) {
  const server = startNode("app.js", [], {
    cwd: chapterPath("chapter7", directory),
    env: mongoEnv(),
  });
  t.after(() => server.stop());
  await waitForOutput(server, /Server started/);

  let created;
  try {
    created = await eventually(async () => {
      const response = await fetch("http://127.0.0.1:3000/write", {
        method: "POST",
        redirect: "manual",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: `${directory} e2e`,
          writer: "wapj",
          password: "test-password",
          content: "chapter7 end-to-end",
        }),
      });
      assert.equal(response.status, 302);
      return response;
    });
  } catch (error) {
    throw new Error(`${error.message}\n${server.output}`, { cause: error });
  }
  const location = created.headers.get("location");
  assert.match(location, /^\/detail\/[a-f\d]{24}$/i);
  const id = location.split("/").pop();

  const detail = await fetch(`http://127.0.0.1:3000${location}`);
  assert.equal(detail.status, 200);
  assert.match(await detail.text(), new RegExp(`${directory} e2e`));

  assert.deepEqual(
    await jsonRequest("http://127.0.0.1:3000/check-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, password: "test-password" }),
    }),
    { isExist: true }
  );

  assert.deepEqual(
    await jsonRequest("http://127.0.0.1:3000/delete", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, password: "test-password" }),
    }),
    { isSuccess: true }
  );

  await server.stop();
}

test("chapter7: both board applications complete a MongoDB-backed flow", async (t) => {
  await exerciseBoard(t, "board");
  await exerciseBoard(t, "board-tailwind");
});
