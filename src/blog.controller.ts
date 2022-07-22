import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('blog')
export class BlogController {
  @Get()
  getAllPosts() {
    console.log('모든 게시글 가져오기');
  }

  @Post()
  createPost() {
    console.log('게시글 작성');
  }

  @Get('/:id')
  getPost() {
    console.log('하나의 게시글 가져오기');
  }

  @Delete('/:id')
  deletePost() {
    console.log('게시글 삭제');
  }

  @Put('/:id')
  updatePost() {
    console.log('게시글 업데이트');
  }
}
