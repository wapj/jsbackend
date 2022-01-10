function func1() {
  console.log("1");
  func2();
  return;
}

function func2() {
  console.log("2");
  return;
}

func1();
