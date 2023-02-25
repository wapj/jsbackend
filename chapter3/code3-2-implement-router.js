const http = require("http");
const url = require("url"); // ❶
http
  .createServer((req, res) => {
    const path = url.parse(req.url, true).pathname; // ❷
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (path === "/user") {
      res.end("[user] name : andy, age: 30"); // ❸
    } else if (path === "/feed") {
      res.end(`<meta charset="UTF-8"><ul>
            <li>picture1</li>
            <li>picture2</li>
            <li>picture3</li>
          </ul>
      `); // ➍
    } else {
      res.statusCode = 404;
      res.end("404 page not found"); // ➎
    }
  })
  .listen("3000", () => console.log("라우터를 만들어보자!"));
