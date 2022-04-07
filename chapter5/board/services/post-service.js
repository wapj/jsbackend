const { ObjectId } = require("mongodb");

// 패스워드는 노출 할 필요가 없으므로 결과값으로 가져오지않음.
const projectionOption = {
  projection: {
    // 프로젝션(투영) 결과값에서 일부만 가져올 때 사용함.
    password: 0,
    "comments.password": 0,
  },
};

async function getPostById(collection, id) {
  return await collection.findOne({ _id: ObjectId(id) }, projectionOption);
}

async function getPostByIdAndPassword(collection, { id, password }) {
  return await collection.findOne({ _id: ObjectId(id), password: password }, projectionOption);
}

async function updatePost(collection, id, post) {
  const toUpdatePost = {
    $set: {
      ...post,
    },
  };

  return await collection.updateOne({ _id: ObjectId(id) }, toUpdatePost);
}

// 글작성
async function writePost(collection, post) {
  // 생성일시와 조회수를 넣어준다.
  post.hits = 0;
  post.createdDt = new Date().toISOString();
  return await collection.insertOne(post);
}

module.exports = {
  writePost,
  getPostById,
  getPostByIdAndPassword,
  updatePost,
  projectionOption,
};
