"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
class BlogService {
    constructor() {
        this.posts = [];
    }
    getAllPosts() {
        return this.posts;
    }
    createPost(postDto) {
        const id = this.posts.length + 1;
        this.posts.push(Object.assign(Object.assign({ id: id.toString() }, postDto), { createdDt: new Date() }));
    }
    getPost(id) {
        const post = this.posts.find((post) => {
            return post.id === id;
        });
        console.log(post);
        return post;
    }
    delete(id) {
        const filteredPosts = this.posts.filter((post) => post.id !== id);
        this.posts = [...filteredPosts];
    }
    updatePost(id, postDto) {
        let updateIndex = this.posts.findIndex((post) => post.id === id);
        const updatePost = Object.assign(Object.assign({ id }, postDto), { updatedDt: new Date() });
        this.posts[updateIndex] = updatePost;
        return updatePost;
    }
}
exports.BlogService = BlogService;
//# sourceMappingURL=blog.service.js.map