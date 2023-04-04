import { readFile, writeFile } from "fs/promises";
import { PostDto } from "./blog.model";

// 블로그 인터페이스
export interface BlogRepository {
  getAllPost(): Promise<PostDto[]>;
  createPost(postDto: PostDto);
  getPost(id: String): Promise<PostDto>;
  deletePost(id: String);
  updatePost(id: String, postDto: PostDto);
}

// 블로그 인터페이스를 구현하여 파일에 데이터를 저장하는 클래스
export class BlogFileRepository implements BlogRepository {
  FILE_NAME = "./src/blog.data.json";

  async getAllPost(): Promise<PostDto[]> {
    const datas = await readFile(this.FILE_NAME, "utf8");
    const posts = JSON.parse(datas);
    return posts;
  }

  async createPost(postDto: PostDto) {
    const posts = await this.getAllPost();
    const id = posts.length + 1;
    const createPost = { id: id.toString(), ...postDto, createdDt: new Date() };
    posts.push(createPost);
    await writeFile(this.FILE_NAME, JSON.stringify(posts));
  }

  async getPost(id: string): Promise<PostDto> {
    const posts = await this.getAllPost();
    const result = posts.find((post) => post.id === id);
    return result;
  }

  async deletePost(id: string) {
    const posts = await this.getAllPost();
    const filteredPosts = posts.filter((post) => post.id !== id);
    await writeFile(this.FILE_NAME, JSON.stringify(filteredPosts));
  }

  async updatePost(id: string, postDto: PostDto) {
    const posts = await this.getAllPost();
    const index = posts.findIndex((post) => post.id === id);
    const updatePost = { id, ...postDto, updatedDt: new Date() };
    posts[index] = updatePost;
    await writeFile(this.FILE_NAME, JSON.stringify(posts));
  }
}
