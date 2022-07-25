import { PostDto } from './blog.model';
export declare class BlogService {
    posts: any[];
    getAllPosts(): any[];
    createPost(postDto: PostDto): void;
    getPost(id: any): any;
    delete(id: any): void;
    updatePost(id: any, postDto: PostDto): {
        updatedDt: Date;
        id: string;
        title: string;
        content: string;
        name: string;
        createdDt: Date;
    };
}
