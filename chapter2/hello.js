const http = require("http"); // ❶ http 객체 생성

let count = 0;

// 노드 서버 객체 생성
const server = http.createServer((req, res) => {
  log(count);
  res.statusCode = 200; // ❸
  res.setHeader("Content-Type", "text/plain"); // ➍
  res.write("hello\n"); // ➎
  // prettier-ignore
  setTimeout(() => { // ➏
    res.end("Node.js");
  }, 2000);
});

function log(count) {
  console.log((count += 1)); // ❷
}

server.listen(8000, () => console.log("Hello Node.js")); // ➐ 접속 대기
