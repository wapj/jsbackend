const http = require('http');                           // 1
const server = http.createServer((req, res) => {        // 2
    res.statusCode = 200;                               // 3
    res.setHeader('Content-Type', 'text/plain');        // 4
    res.write("hello\n");                               // 5
    setTimeout(() => {                                  // 6
        res.end("Node.js")
    }, 2000);
})

server.listen(8000);                                    // 7