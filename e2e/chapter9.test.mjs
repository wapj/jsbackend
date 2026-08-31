import assert from "node:assert/strict";
import { once } from "node:events";
import http from "node:http";
import test from "node:test";
import {
  buildNest,
  chapterPath,
  startNode,
  waitForHttp,
} from "./support/process.mjs";

async function startWeatherFixture() {
  const server = http.createServer((request, response) => {
    assert.match(request.url, /^\/weather\?key=e2e-key$/);
    response.setHeader("content-type", "application/json");
    response.end(
      JSON.stringify({ weather: [{ main: "Rain" }, { main: "Clear" }] })
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server;
}

test("chapter9: layered config and the weather API integration work", async (t) => {
  const configCwd = chapterPath("chapter9", "config-test");
  await buildNest(configCwd);
  const configServer = startNode("dist/main.js", [], {
    cwd: configCwd,
    env: {
      NODE_ENV: "local",
      SERVER_PORT: "3000",
      MESSAGE: "chapter9-e2e-message",
      SERVICE_URL: "http://service.e2e.local",
      SERVER_URL: "http://server.e2e.local",
    },
  });
  t.after(() => configServer.stop());
  await waitForHttp("http://127.0.0.1:3000/");
  assert.equal(
    await (await fetch("http://127.0.0.1:3000/")).text(),
    "chapter9-e2e-message"
  );
  assert.equal(
    await (await fetch("http://127.0.0.1:3000/service-url")).text(),
    "http://service.e2e.local"
  );
  assert.equal(
    await (await fetch("http://127.0.0.1:3000/server-url")).text(),
    "http://server.e2e.local"
  );
  await configServer.stop();

  const fixture = await startWeatherFixture();
  t.after(() => new Promise((resolve) => fixture.close(resolve)));
  const fixturePort = fixture.address().port;
  const weatherCwd = chapterPath("chapter9", "weather_api_test");
  await buildNest(weatherCwd);
  const weatherServer = startNode("dist/main.js", [], {
    cwd: weatherCwd,
    env: {
      WEATHER_API_URL: `http://127.0.0.1:${fixturePort}/weather?key=`,
      WEATHER_API_KEY: "e2e-key",
    },
  });
  t.after(() => weatherServer.stop());
  await waitForHttp("http://127.0.0.1:3000/");
  const weatherResponse = await fetch("http://127.0.0.1:3000/weather");
  assert.equal(weatherResponse.status, 200);
  assert.equal(await weatherResponse.text(), "Rain and Clear");
  await weatherServer.stop();
});
