const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// config
app.engine(
  "handlebars",
  handlebars.engine({
    helper: require("./config/handlebars-helpers"),
  }),
);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// 정적파일 위치
app.use("/statics", express.static(__dirname + "/statics"));

// route
app.get("/", (req, res) => {
  const onePost = {
    idx: 311011,
    title: "안녕하세요. 반갑습니다. 좋은 저녁입니다.",
    writer: "앤디",
    hits: 12345,
    createdDt: "2022.03.11",
  };

  const posts = [onePost, onePost, onePost, onePost, onePost, onePost, onePost, onePost, onePost, onePost];

  res.render("home", { title: "테스트 게시판", posts });
});

app.get("/write", (req, res) => {
  res.render("write", { title: "테스트 게시판" });
});

app.get("/detail", (req, res) => {
  res.render("detail", {
    boardTitle: "테스트 게시판",
    title: "안녕하세요",
    name: "andy.sg",
    hits: 123123,
    createdDt: "2022-03-22",
    content:
      "안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n안녕하세요~!\nNode.js 책 열심히 썼습니다!\n읽어보시면 후회 안하실 거예요!\n",
    comments: [
      { name: "앤디", comment: "하이", createdDt: "2022-03-13" },
      { name: "앤디", comment: "하이", createdDt: "2022-03-13" },
      { name: "앤디", comment: "하이", createdDt: "2022-03-13" },
    ],
  });
});

app.listen(3000);
