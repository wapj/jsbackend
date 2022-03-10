const express = require("express");
const handlebars = require("express-handlebars");

const app = express();

// config
app.engine("handlebars", handlebars.engine());
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

app.listen(3000);
