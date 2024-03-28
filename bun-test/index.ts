import figlet from "figlet";

const server = Bun.serve({
  port:3000,
  fetch(req) {
    var url = req.url;
    const { searchParams } = new URL(req.url)
    console.log(searchParams);
    const text = searchParams.get("text") || "Hello, Bun!";
    const body = figlet.textSync(text);
    return new Response(body);
  },
});

console.log(`서버 기동중 http://localhost:${server.port}`);
console.log("<TEST BELOW>\nhttp://localhost:3000/?text=Become%20Node.js%20Developer")