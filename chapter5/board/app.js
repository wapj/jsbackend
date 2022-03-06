const express = require("express");
const handlebars = require("express-handlebars");

const app = express();

// config
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// app.use("/statics", express.static(__dirname + "/statics"));

// route
app.get("/", (req, res) => {
  res.render("home", { title: "안녕하세요", message: "만나서 반갑습니다!" });
});

app.listen(3000);
