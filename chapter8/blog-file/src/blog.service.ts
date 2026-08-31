import { PostDto } from "./blog.model";
import { BlogFileRepository, BlogRepository } from "./blog.repository";

export class BlogService {
  blogRepository: BlogRepository;
  constructor() {
    this.blogRepository = new BlogFileRepository();
  }

  posts = [];

  async getAllPosts() {
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
