# Chapter E2E tests

The root E2E suite runs every chapter directory that exists in this repository:
`chapter0` and `chapter2` through `chapter13`. There is no `chapter1` directory.

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
npm run test:e2e
```

Run one chapter while debugging by passing its directory name:

```sh
npm run test:e2e -- chapter7
```
