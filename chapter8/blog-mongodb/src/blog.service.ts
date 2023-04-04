import { Injectable } from '@nestjs/common';
import { PostDto } from "./blog.model";
import { BlogMongoRepository } from "./blog.repository";

@Injectable()
export class BlogService {
  
  constructor(private blogRepository: BlogMongoRepository) {  }

  posts = [];

  async getAllPosts() {
    console.log(this.blogRepository)
    return await this.blogRepository.getAllPost();
  }

  createPost(postDto: PostDto) {
    this.blogRepository.createPost(postDto);
  }

  async getPost(id): Promise<PostDto> {
    return await this.blogRepository.getPost(id);
  }

  delete(id) {
    this.blogRepository.deletePost(id);
  }

  updatePost(id, postDto: PostDto) {
    this.blogRepository.updatePost(id, postDto);
  }
}
