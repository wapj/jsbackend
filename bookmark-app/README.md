# NestJS 북마크 앱

- 북마크 추가 기능:
    - 사용자는 북마크의 제목(title)과 URL(url)을 입력하여 새로운 북마크를 추가할 수 있어야 합니다.
    - 북마크 추가 시 짧은 URL(shortUrl)이 자동으로 생성되어야 합니다.
    - 생성된 짧은 URL은 중복되지 않는 고유한 값이어야 합니다.
- 북마크 리스트 조회 기능:
    - 사용자는 추가된 모든 북마크의 리스트를 조회할 수 있어야 합니다.
    - 각 북마크 항목에는 제목, URL, 짧은 URL이 표시되어야 합니다.
    - 제목과 URL은 클릭 가능한 링크로 표시되어야 하며, 해당 링크를 클릭하면 새 탭에서 해당 URL로 이동해야 합니다.
- 북마크 상세 조회 기능:
    - 사용자는 짧은 URL을 통해 해당 북마크의 상세 정보를 조회할 수 있어야 합니다.
    - 상세 정보에는 제목, URL, 짧은 URL이 표시되어야 합니다.
- 북마크 수정 기능:
    - 사용자는 기존 북마크의 제목과 URL을 수정할 수 있어야 합니다.
    - 수정된 내용은 즉시 반영되어야 하며, 리스트에서도 업데이트되어 표시되어야 합니다.
- 북마크 삭제 기능:
    - 사용자는 불필요한 북마크를 삭제할 수 있어야 합니다.
    - 삭제 시 해당 북마크가 리스트에서 즉시 제거되어야 합니다.
- 짧은 URL 리다이렉션 기능:
    - 사용자가 짧은 URL을 브라우저에 입력하면 해당 북마크의 원래 URL로 리다이렉션되어야 합니다.
    - 리다이렉션 시 HTTP 301 (Permanent Redirect) 상태 코드를 사용하여 영구적인 리다이렉션을 나타내야 합니다.
- 사용자 인터페이스:
    - 사용자 인터페이스는 간단하게 만들면 됩니다.
    - 북마크 추가, 수정, 삭제 버튼이 표시되어야 합니다.
    - 북마크 리스트는 페이징이 필요없으며, 각 북마크 항목은 구분되어 보여야 합니다.
- 데이터 저장소:
    - 북마크 데이터는 SQLite 데이터베이스를 사용합니다.
    - 데이터베이스 스키마는 북마크의 제목, URL, 짧은 URL 등의 필드를 포함해야 합니다.
- 백엔드 API:
    - 백엔드는 NestJS를 사용합니다.
    - RESTful API 형식으로 북마크 추가, 조회, 수정, 삭제 기능을 제공해야 합니다.
    - 짧은 URL에 대한 리다이렉션 기능도 백엔드에서 처리되어야 합니다.
- 프론트엔드:
    - 프론트엔드는 HTML, CSS, JavaScript를 사용하면되고, 리액트등의 프론트엔드 기술은 자유롭게 사용가능합니다.
    - 사용자 인터페이스는 반응형으로 디자인되어 다양한 화면 크기에 적합하게 표시되어야 합니다.
    - 북마크 추가, 수정, 삭제 등의 기능은 AJAX를 사용하여 백엔드 API와 통신합니다.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

