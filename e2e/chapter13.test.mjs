import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { io } from "socket.io-client";
import WebSocket, { WebSocketServer } from "ws";
import {
  buildNest,
  chapterPath,
  startNode,
  waitForHttp,
  waitForPort,
} from "./support/process.mjs";

function onceSocket(socket, event, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for Socket.IO event ${event}`));
    }, timeoutMs);
    const onEvent = (value) => {
      cleanup();
      resolve(value);
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      socket.off(event, onEvent);
      socket.off("connect_error", onError);
    };
    socket.once(event, onEvent);
    socket.once("connect_error", onError);
  });
}

function onceWebSocketMessage(socket, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for a WebSocket message"));
    }, timeoutMs);
    const onMessage = (message) => {
      cleanup();
      resolve(message.toString());
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onClose = (code) => {
      cleanup();
      reject(new Error(`WebSocket closed before a message (${code})`));
    };
    const cleanup = () => {
      clearTimeout(timeout);
      socket.off("message", onMessage);
      socket.off("error", onError);
      socket.off("close", onClose);
    };
    socket.once("message", onMessage);
    socket.once("error", onError);
    socket.once("close", onClose);
  });
}

function connectSocket(namespace = "") {
  return io(`http://127.0.0.1:3000${namespace}`, {
    forceNew: true,
    reconnection: false,
    transports: ["websocket"],
  });
}

test("chapter13: a silent raw WebSocket fails within its deadline", async (t) => {
  const silentServer = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  await once(silentServer, "listening");
  const { port } = silentServer.address();
  const client = new WebSocket(`ws://127.0.0.1:${port}`);
  await once(client, "open");
  t.after(
    () =>
      new Promise((resolve) => {
        client.terminate();
        silentServer.close(resolve);
      })
  );

  await assert.rejects(onceWebSocketMessage(client, 100), /Timed out/);
});

test("chapter13: raw WebSocket and both Socket.IO chat apps exchange messages", async (t) => {
  const echo = startNode("server.js", [], {
    cwd: chapterPath("chapter13", "echo-websocket"),
  });
  t.after(() => echo.stop());
  await waitForPort(echo, 3000);
  const rawClient = new WebSocket("ws://127.0.0.1:3000");
  t.after(() => rawClient.close());
  const greeting = await onceWebSocketMessage(rawClient);
  assert.match(greeting, /서버 접속 완료/);
  const echoed = onceWebSocketMessage(rawClient);
  rawClient.send("chapter13-e2e");
  assert.match(await echoed, /chapter13-e2e/);
  rawClient.close();
  await echo.stop();

  const simpleCwd = chapterPath("chapter13", "simple-nest-chat");
  await buildNest(simpleCwd);
  const simple = startNode("dist/main.js", [], { cwd: simpleCwd });
  t.after(() => simple.stop());
  await waitForHttp(simple, "http://127.0.0.1:3000/");
  const simpleSender = connectSocket();
  const simpleReceiver = connectSocket();
  t.after(() => {
    simpleSender.close();
    simpleReceiver.close();
  });
  await Promise.all([
    onceSocket(simpleSender, "connect"),
    onceSocket(simpleReceiver, "connect"),
  ]);
  const simpleMessage = onceSocket(simpleReceiver, "message");
  simpleSender.emit("message", "hello-simple-chat");
  assert.match(await simpleMessage, /hello-simple-chat/);
  simpleSender.close();
  simpleReceiver.close();
  await simple.stop();

  const chatCwd = chapterPath("chapter13", "nest-chat");
  await buildNest(chatCwd);
  const chat = startNode("dist/main.js", [], { cwd: chatCwd });
  t.after(() => chat.stop());
  await waitForHttp(chat, "http://127.0.0.1:3000/");

  const chatSender = connectSocket("/chat");
  const chatReceiver = connectSocket("/chat");
  t.after(() => {
    chatSender.close();
    chatReceiver.close();
  });
  await Promise.all([
    onceSocket(chatSender, "connect"),
    onceSocket(chatReceiver, "connect"),
  ]);
  const chatMessage = onceSocket(chatReceiver, "message");
  chatSender.emit("message", { nickname: "wapj", message: "hello-chat" });
  assert.deepEqual(await chatMessage, { message: "wapj: hello-chat" });

  const roomSender = connectSocket("/room");
  const roomReceiver = connectSocket("/room");
  t.after(() => {
    roomSender.close();
    roomReceiver.close();
  });
  await Promise.all([
    onceSocket(roomSender, "connect"),
    onceSocket(roomReceiver, "connect"),
  ]);
  const rooms = onceSocket(roomReceiver, "rooms");
  roomSender.emit("createRoom", { nickname: "wapj", room: "e2e-room" });
  assert.deepEqual(await rooms, ["e2e-room"]);

  const senderJoined = onceSocket(chatReceiver, "notice");
  roomSender.emit("joinRoom", {
    nickname: "wapj",
    room: "e2e-room",
    toLeaveRoom: "",
  });
  assert.match((await senderJoined).message, /wapj/);

  const receiverJoined = onceSocket(chatReceiver, "notice");
  roomReceiver.emit("joinRoom", {
    nickname: "receiver",
    room: "e2e-room",
    toLeaveRoom: "",
  });
  assert.match((await receiverJoined).message, /receiver/);

  const roomMessage = onceSocket(roomReceiver, "message");
  roomSender.emit("message", {
    nickname: "wapj",
    room: "e2e-room",
    message: "hello-room",
  });
  assert.deepEqual(await roomMessage, { message: "wapj: hello-room" });
});
