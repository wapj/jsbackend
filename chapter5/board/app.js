const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

const mongodbConnection = require("./configs/mongodb-connection");

let client;
mongodbConnection(function (err, mongoClient) {
  if (err) throw err;
  client = mongoClient;
  console.dir(client);
  app.listen(3000);
  console.log("START!");
});

// config
app.engine(
  "handlebars",
  handlebars.engine({
    helper: require("./configs/handlebars-helpers"),
  }),
);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// 정적파일 위치
app.use("/statics", express.static(__dirname + "/statics"));

// req.body와 post요청을 해석하기 위한 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post("/write", (req, res) => {
  console.log(req.body);

  client.db().collection("post").insertOne(req.body);
  // 나중에는 해당 글의 페이지로 리다이렉트 한다.
  res.redirect("/");
});

app.get("/detail", (req, res) => {
  res.render("detail", {
    boardTitle: "테스트 게시판",
    title: "게시판 글쓰기 테스트",
    name: "andy",
    hits: 123456789,
    createdDt: "2022-03-22",
    content: "안녕하세요~!\ntailwind와 daisyui로 만드는 게시판입니다.\n잘 완성 해봅시다.",
    comments: [
      { name: "승귤", comment: "안녕하세요! \nNode.js 공부중이예요!", createdDt: "2022-03-13" },
      { name: "앤디", comment: "방갑습니다! \ntailwind로 만든 디자인 깔끔하군요!", createdDt: "2022-03-14" },
      { name: "지현", comment: "좋네요! \n저도 게시판 만들고 있는데 좋아요!", createdDt: "2022-03-24" },
    ],
  });
});
