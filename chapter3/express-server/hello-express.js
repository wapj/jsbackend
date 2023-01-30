const express = require("express"); // ❶
const app = express(); // ❷
const port = 3000;

// prettier-ignore
app.get("/", (req, res) => { // ❸ 
  res.set({ "Content-Type": "text/html; charset=utf-8" }); // ➍
  res.end("헬로 Express");
});

// prettier-ignore
app.listen(port, () => { // ➎
  console.log(`START SERVER : use ${port}`);
});
