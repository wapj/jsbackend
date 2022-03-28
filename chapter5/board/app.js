const express = require("express");
const handlebars = require("express-handlebars");
const { ObjectId } = require("mongodb");

const app = express();
const mongodbConnection = require("./configs/mongodb-connection");
const { getPostById, getPostByIdAndPassword } = require("./services/post-service");

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

// 리스트 페이지
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

// 쓰기 페이지 이동
app.get("/write", (req, res) => {
  res.render("write", { title: "테스트 게시판", mode: "create" });
});

// 수정 페이지로 이동
app.get("/modify/:id", async (req, res) => {
  const { id } = req.params.id;

  const post = await getPostById(collection, req.params.id);
  console.log(post);
  res.render("write", { title: "테스트 게시판 ", mode: "modify", post });
});

app.post("/modify/", async (req, res) => {
  const { id, title, writer, password, content } = req.body;

  const post = {
    title,
    writer,
    password,
    content,
    hits: 0,
    createdDt: new Date().toISOString(),
  };

  const updateDocument = {
    $set: {
      ...post,
    },
  };

  const result = await collection.updateOne({ _id: ObjectId(id) }, updateDocument);

  res.redirect(`/detail/${id}`);
});

app.post("/check-password", async (req, res) => {
  const { id, password } = req.body;
  const post = getPostByIdAndPassword(collection, { id, password });
  if (!post) {
    return res.status(404).json({ isExist: false });
  } else {
    return res.json({ isExist: true });
  }
});

app.post("/write", async (req, res) => {
  const post = req.body;
  // 생성일시와 조회수를 넣어준다.
  post.hits = 0;
  post.createdDt = new Date().toISOString();
  const result = await collection.insertOne(post);
  res.redirect(`/detail/${result.insertedId}`);
});

app.delete("/delete", async (req, res) => {
  const { id, password } = req.body;
  // id로 삭제
  try {
    const result = await collection.deleteOne({ _id: ObjectId(id), password: password });
    if (result.deletedCount !== 1) {
      console.log("삭제실패");
      return res.json({ isSuccess: false });
    }

    // 삭제성공인 경우 리다이렉트
    return res.json({ isSuccess: true });
  } catch (error) {
    console.error(error);
    return res.json({ isSuccess: false });
  }
});

app.get("/detail/:id", async (req, res) => {
  const post = await getPostById(collection, req.params.id);
  res.render("detail", {
    title: "테스트 게시판",
    post,
  });
});
