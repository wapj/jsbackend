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

  async createPost(postDto: PostDto) {
    await this.blogRepository.createPost(postDto);
  }

  async getPost(id): Promise<PostDto> {
    return await this.blogRepository.getPost(id);
  }

  async delete(id) {
    await this.blogRepository.deletePost(id);
  }

  async updatePost(id, postDto: PostDto) {
    await this.blogRepository.updatePost(id, postDto);
  }
}
