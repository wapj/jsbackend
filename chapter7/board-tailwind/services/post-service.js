const { ObjectId } = require("mongodb");
const paginator = require("../utils/paginator");

// 글작성
async function writePost(collection, post) {
  // 생성일시와 조회수를 넣어준다.
  post.hits = 0;
  post.createdDt = new Date().toISOString();
  return await collection.insertOne(post);
}

// 글목록
async function list(collection, page, search) {
  const perPage = 10;
  const query = { title: new RegExp(search, "i") };
  const cursor = collection.find(query, { limit: perPage, skip: (page - 1) * perPage }).sort({
    createdDt: -1,
  });
  const totalCount = await collection.count(query);
  const posts = await cursor.toArray();
  const paginatorObj = paginator({ totalCount, page, perPage: perPage });
  return [posts, paginatorObj];
}

// 패스워드는 노출 할 필요가 없으므로 결과값으로 가져오지않음.
const projectionOption = {
  projection: {
    // 프로젝션(투영) 결과값에서 일부만 가져올 때 사용함.
    password: 0,
    "comments.password": 0,
  },
};

async function getDetailPost(collection, id) {
  return await collection.findOneAndUpdate({ _id: ObjectId(id) }, { $inc: { hits: 1 } }, projectionOption);
}

async function getPostByIdAndPassword(collection, { id, password }) {
  return await collection.findOne({ _id: ObjectId(id), password: password }, projectionOption);
}

async function getPostById(collection, id) {
  return await collection.findOne({ _id: ObjectId(id) }, projectionOption);
}

async function updatePost(collection, id, post) {
  const toUpdatePost = {
    $set: {
      ...post,
    },
  };

  return await collection.updateOne({ _id: ObjectId(id) }, toUpdatePost);
}

module.exports = {
  list,
  writePost,
  getDetailPost,
  getPostById,
  getPostByIdAndPassword,
  updatePost,
  projectionOption,
};
