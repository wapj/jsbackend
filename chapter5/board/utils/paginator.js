const lodash = require("lodash");
const PAGE_LIST_SIZE = 10;

module.exports = ({ totalCount, page, perPage = 10 }) => {
  const PER_PAGE = perPage;
  const totalPage = Math.ceil(totalCount / PER_PAGE);

  // 시작페이지
  let quotient = parseInt(page / PAGE_LIST_SIZE);
  if (page % PAGE_LIST_SIZE === 0) {
    quotient -= 1;
  }
  const startPage = quotient * PAGE_LIST_SIZE + 1;

  // 끝페이지 : startPage + PAGE_LIST_SIZE - 1
  const endPage = startPage + PAGE_LIST_SIZE - 1 < totalPage ? startPage + PAGE_LIST_SIZE - 1 : totalPage;
  const isFirstPage = page === 1;
  const isLastPage = page === totalPage;
  const hasPrev = page > 1;
  const hasNext = page < totalPage;

  const paginator = {
    pageList: lodash.range(startPage, endPage + 1),
    page,
    prevPage: page - 1,
    nextPage: page + 1,
    startPage,
    lastPage: totalPage,
    hasPrev,
    hasNext,
    isFirstPage,
    isLastPage,
  };
  return paginator;
};
