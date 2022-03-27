module.exports = {
  lengthOfList: function (list) {
    return list.length;
  },
  isEqual: function (val1, val2) {
    return val1 === val2;
  },
  dateString: function (isoString) {
    return new Date(isoString).toLocaleDateString();
  },
};
