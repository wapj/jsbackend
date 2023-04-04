// 1 데코레이터 함수 임포트
import {
  Controller,
  Param,
  Body,
  Delete,
  Get,
  Post,
  Put,
} from "@nestjs/common";
import { BlogService } from "./blog.service";

@Controller("blog")
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  getAllPosts() {
    return this.blogService.getAllPosts();
  }

  @Post()
  createPost(@Body() postDto) {
    console.log("게시글 작성");
    this.blogService.createPost(postDto);
    return "success";
  }

  @Get("/:id")
  async getPost(@Param("id") id: string) {
    console.log("게시글 하나 가져오기");
    const post = await this.blogService.getPost(id);
    console.log(post);
    return post;
  }

  @Delete("/:id")
  deletePost(@Param("id") id: string) {
    console.log("게시글 삭제");
    this.blogService.delete(id);
  }

  @Put("/:id")
  updatePost(@Param("id") id, @Body() postDto) {
    console.log(`[${id}] 게시글 업데이트`, id, postDto);
    return this.blogService.updatePost(id, postDto);
  }
}
