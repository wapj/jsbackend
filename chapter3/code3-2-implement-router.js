const http = require("http");
const url = require("url"); // 1
http
  .createServer((req, res) => {
    const path = url.parse(req.url, true).pathname; // 2
    res.setHeader("Content-Type", "text/html");

    if (path === "/user") {
      res.end(`
      [user] name : andy, age: 30`); // 3
    } else if (path === "/feed") {
      res.end(`<ul>
        <li>picture1</li>
        <li>picture2</li>
        <li>picture3</li>
      </ul>
      `); // 4
    } else {
      res.statusCode = 404;
      res.end("404 page not found"); // 5
    }
  })
  .listen("3000", () => console.log("라우터를 만들어보자!"));
