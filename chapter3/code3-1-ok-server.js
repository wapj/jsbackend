const http = require("http"); // 1
http
  // 2
  .createServer((req, res) => {
    res.setHeader("Content-Type", "text/html"); // 3
    res.end("OK"); // 4
  })
  .listen("3000", () => console.log("OK서버 시작!")); // 5
