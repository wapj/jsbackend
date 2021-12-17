const http = require("http");
const { homedir } = require("os");
const url = require("url");

const test = (req, res) => {
  res.end("TEST");
};

const home = (req, res) => {
  res.end("HOME");
};

const user = (req, res) => {
  console.log(req);
  const query = url.parse(req.url, true).query;
  console.log(query);
  res.end(userTemplate(query));
};

const feed = (req, res) => {
  res.end(`<ul>
          <li>picture1</li>
          <li>picture2</li>
          <li>picture3</li>
        </ul>
        `);
};

const urlMap = {
  "/": home,
  "/test": test,
  "/user": user,
  "/feed": feed,
};

http
  .createServer((req, res) => {
    const path = url.parse(req.url, true).pathname;
    res.setHeader("Content-Type", "text/html");

    if (req.method !== "GET") {
      notAllowdMethod(req, res);
      return;
    }
    console.log(path);
    console.log(Object.keys(urlMap));
    if (path in urlMap) {
      urlMap[path](req, res);
    } else {
      notFound(req, res);
    }
  })
  .listen(3000, () => {
    console.log("심플 서버 시작");
  });

const userTemplate = (user) => {
  return `
    <html>
    <body>
    <h1>User info </h1>
    name : ${user.name} <br />
    age : ${user.age}
    </body>
    </html>
    `;
};

const loginTemplate = `<html>
  <input type="text" placeholer="userid" /> <br />
  <input type="password" /> <br />
  <input type="submit" value="login">  
  </html>`;
const login = (req, res) => {
  res.end(loginTemplate);
};

const notFoundTemplate = `
  <h1>404 page not found</h1>
  `;

const notFound = (req, res) => {
  res.end(notFoundTemplate);
};

const notAllowdMethod = (req, res) => {
  res.end(`${req.method} is not allowed http method`);
};
