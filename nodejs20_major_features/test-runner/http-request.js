export default class HttpRequest {
    async get(url) {
        return await fetch(url, { redirect: "follow" })
    }
}