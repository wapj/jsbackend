const http = require("http");
const url = require("url");

http
  .createServer((req, res) => {
    const path = url.parse(req.url, true).pathname;
    res.setHeader("Content-Type", "text/html");
    if (path in urlMap) {
      // 1
      try {
        urlMap[path](req, res);
      } catch (err) {
        console.log(err);
        serverError(req, res);
      }
      // 2
    } else {
      notFound(req, res);
    }
  })
  .listen("3000", () => console.log("라우터를 리팩토링해보자!"));

const user = (req, res) => {
  throw Error("!!!");
  const user = url.parse(req.url, true).query;
  res.end(`[user] name : ${user.name}, age: ${user.age}`);
};

const feed = (req, res) => {
  res.end(`<ul>
        <li>picture1</li>
        <li>picture2</li>
        <li>picture3</li>
      </ul>
      `);
};

const notFound = (req, res) => {
  res.statusCode = 404;
  res.end("404 page not found");
};

const serverError = (req, res) => {
  res.statusCode = 500;
  res.end("500 server error");
};

// 3
const urlMap = {
  "/": (req, res) => res.end("HOME"),
  "/user": user,
  "/feed": feed,
};
