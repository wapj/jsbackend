const express = require("express");

const handlebars = require("express-handlebars");
const app = express();

const mongodbConnection = require("./configs/mongodb-connection");
const { ObjectID, ObjectId } = require("mongodb");

const PER_PAGE = 10;

let collection;
mongodbConnection(function (err, mongoClient) {
  if (err) throw err;

  const client = mongoClient;
  collection = client.db().collection("post");
  app.listen(3000);
  console.log("START!");
});

// config
app.engine(
  "handlebars",
  handlebars.create({
    helpers: require("./configs/handlebars-helpers"),
  }).engine,
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
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";
  const query = { title: new RegExp(search, "i") };
  const options = { limit: PER_PAGE, skip: (page - 1) * PER_PAGE };
  collection.find(query, options).toArray(async (err, posts) => {
    if (err) {
      return res.render("home", { title: "테스트 게시판" });
    }
    const totalCount = await collection.count(query);
    const paginator = require("./utils/paginator")({ totalCount, page, perPage: PER_PAGE });
    res.render("home", { title: "테스트 게시판", search, paginator, posts });
  });
});

app.get("/write", (req, res) => {
  res.render("write", { title: "테스트 게시판" });
});

app.post("/write", (req, res) => {
  console.log(req.body);
  const post = req.body;
  // 생성일시와 조회수를 넣어준다.
  post.hits = 0;
  post.createdDt = new Date().toISOString();
  collection.insertOne(req.body);
  // TODO 상세페이지를 만들고나서 해당 글의 페이지로 리다이렉트 한다.
  res.redirect("/");
});

app.delete("/delete/:id", async (req, res) => {
  // id로 삭제
  try {
    const result = await collection.deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 1) {
      console.log("삭제성공");
    } else {
      console.log("삭제실패");
    }

    // 목록으로
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
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
