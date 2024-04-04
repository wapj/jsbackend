# bun-test

## bun이란? 

Bun은 번들러, 테스트 실행기 및 Node.js 호환 패키지 관리자를 갖춘 속도를 위해 설계된 올인원 JavaScript 런타임 및 툴킷. 

즉 Node.js에서 고민했던 부분을 많이 해소해준 자바스크립트/타입스크립트 런타임


1.1에서 window를 지원함
https://bun.sh/docs/installation#windows


## bun 설치 

```
curl -fsSL https://bun.sh/install | bash
```


## 프로젝트 초기화  

```
bun init
```


## 의존성 설치

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## figlet과 bun.serve 를 활용하여 간단한 웹서버 만들기 

```bash
bun add figlet
bun add @types/figlet
```

```javascript
import figlet from "figlet";

const server = Bun.serve({
  port:3000,
  fetch(req) {
    var url = req.url;
    const { searchParams } = new URL(req.url)
    console.log(searchParams);
    const text = searchParams.get("text", "Hello Bun");
    const body = figlet.textSync(text);
    return Response(body);
  },
});

console.log(`서버 기동중 localhost:${server.port}`);
```
