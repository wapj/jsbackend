import { Controller, Param, Bind, Body, Query, Get, Post, Put, Delete } from "@nestjs/common";

@Controller("board")
export class BoardController {
  @Get()
  @Bind(Query())
  findAll(query) {
  findAll
    return "모든 게시물을 가져옴";
  }

  @Post()
  @Bind(Body())
  create(boardDto) {
    console.log(JSON.stringify(boardDto));
    return "게시물 생성";
  }

  @Put(":id")
  @Bind(Param("id"), Body())
  update(id, boardDto) {
    console.log(JSON.stringify(boardDto));
    return `게시글 업데이트 ${id} ${boardDto.title} ${boardDto.message}`;
  }

  @Get(":id")
  @Bind(Param())
  findOne(params) {
    return `${params.id} 게시글 가져오기`;
  }

  @Delete(":id")
  @Bind(Param("id"))
  delete(id) {
    return `${id} 게시글 삭제`;
  }
}
