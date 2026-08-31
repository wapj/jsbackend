# Chapter E2E tests

The root E2E suite runs every chapter directory that exists in this repository:
`chapter0` and `chapter2` through `chapter13`. There is no `chapter1` directory.
It also verifies the shared process harness, the bookmark application, and the
Node.js 20 feature examples. The target list is explicit, so deleting a suite or
adding a chapter without a matching E2E test fails repository verification.
The Node.js feature target builds and runs the SEA example in a temporary
directory. The Bun-only sample is installed deterministically and type-checked;
it is not executed because Bun APIs are not part of the Node.js runtime.

The tests exercise real process boundaries, HTTP routes, file uploads, native
WebSocket and Socket.IO traffic, authentication sessions, and CRUD behavior.
MongoDB examples run against a disposable local `mongo:7` Docker container. A
test-only preload redirects MongoDB clients to that container, so the example
connection strings in the chapter source files remain unchanged and are never
contacted by the suite.

## Run the suite

Node.js 24.20.0 and Docker are required.

```sh
npm ci
npm run install:e2e
npm run verify:node24
npm run test:e2e
```

Run one chapter while debugging by passing its directory name:

```sh
npm run test:e2e -- chapter7
```

The additional targets can be selected with `support`, `bookmark`, or
`nodejs20` in the same way.
