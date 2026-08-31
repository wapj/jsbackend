import assert from "node:assert/strict";
import test from "node:test";
import { chapterPath, startNode, waitForPort } from "./support/process.mjs";

const baseUrl = "http://127.0.0.1:3000";

async function exerciseServer(t, script, cwd, exercise) {
  const server = startNode(script, [], { cwd });
  t.after(() => server.stop());
  try {
    await waitForPort(server, 3000);
    await exercise();
  } finally {
    await server.stop();
  }
}

test("chapter3: every HTTP and Express entrypoint runs end to end", async (t) => {
  const chapterCwd = chapterPath("chapter3");

  await exerciseServer(t, "code3-1-ok-server.js", chapterCwd, async () => {
    assert.equal(await (await fetch(`${baseUrl}/`)).text(), "OK");
  });

  await exerciseServer(
    t,
    "code3-2-implement-router.js",
    chapterCwd,
    async () => {
      assert.match(await (await fetch(`${baseUrl}/user`)).text(), /name/);
      assert.equal((await fetch(`${baseUrl}/`)).status, 404);
    }
  );

  await exerciseServer(
    t,
    "code3-3-implement-router.js",
    chapterCwd,
    async () => {
      assert.match(await (await fetch(`${baseUrl}/feed`)).text(), /picture1/);
    }
  );

  await exerciseServer(
    t,
    "code3-4-implement-router2.js",
    chapterCwd,
    async () => {
      assert.match(
        await (await fetch(`${baseUrl}/user?name=wapj&age=30`)).text(),
        /wapj/
      );
    }
  );

  await exerciseServer(
    t,
    "code3-5-refactoring-router.js",
    chapterCwd,
    async () => {
      assert.equal(await (await fetch(`${baseUrl}/`)).text(), "HOME");
      assert.match(
        await (await fetch(`${baseUrl}/user?name=wapj&age=30`)).text(),
        /wapj/
      );
    }
  );

  await exerciseServer(
    t,
    "code3-5-add-server-error.js",
    chapterCwd,
    async () => {
      const response = await fetch(`${baseUrl}/user`);
      assert.equal(response.status, 500);
      assert.equal(await response.text(), "500 server error");
    }
  );

  await exerciseServer(t, "simpleServer.js", chapterCwd, async () => {
    assert.equal(await (await fetch(`${baseUrl}/`)).text(), "HOME");
    assert.match(await (await fetch(`${baseUrl}/feed`)).text(), /picture1/);
    assert.equal(
      await (await fetch(`${baseUrl}/`, { method: "POST" })).text(),
      "POST is not allowed http method"
    );
    assert.match(
      await (await fetch(`${baseUrl}/not-found`)).text(),
      /404 page not found/
    );
  });

  const expressCwd = chapterPath("chapter3", "express-server");
  await exerciseServer(t, "hello-express.js", expressCwd, async () => {
    assert.equal(await (await fetch(`${baseUrl}/`)).text(), "헬로 Express");
  });

  await exerciseServer(t, "refactoring-to-express.js", expressCwd, async () => {
    assert.equal(await (await fetch(`${baseUrl}/`)).text(), "HOME");
    assert.match(
      await (await fetch(`${baseUrl}/user?name=wapj&age=30`)).json(),
      /wapj/
    );
  });

  await exerciseServer(t, "board.js", expressCwd, async () => {
    assert.deepEqual(await (await fetch(`${baseUrl}/`)).json(), []);
    const created = await fetch(`${baseUrl}/posts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Node 24", name: "wapj", text: "e2e" }),
    });
    assert.deepEqual(await created.json(), {
      title: "Node 24",
      name: "wapj",
      text: "e2e",
    });
    assert.equal((await (await fetch(`${baseUrl}/`)).json()).length, 1);
    assert.equal(
      await (await fetch(`${baseUrl}/posts/1`, { method: "DELETE" })).json(),
      "OK"
    );
  });
});
