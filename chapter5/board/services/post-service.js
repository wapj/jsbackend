const { ObjectId } = require("mongodb");

// 패스워드는 노출 할 필요가 없으므로 결과값으로 가져오지않음.
const option = {
  projection: {
    // 프로젝션(투영) 결과값에서 일부만 가져올 때 사용함.
    password: 0,
  },
};

async function getPostById(collection, id) {
  return await collection.findOne({ _id: ObjectId(id) }, option);
}

async function getPostByIdAndPassword(collection, { id, password }) {
  return await collection.findOne({ _id: ObjectId(id), password: password }, option);
}

module.exports = {
  getPostById,
  getPostByIdAndPassword,
};
