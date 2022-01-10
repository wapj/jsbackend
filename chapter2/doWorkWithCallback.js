function doWorkWithCallback(callback) {
  setTimeout(callback, 10000);
}

doWorkWithCallback(() => {
  console.log("오래걸림");
});
