// 변수에 타입을 지정하는 방법
let username: string = "seungkyoo";
let height: number = 179;
let isConditionGood: boolean = true;

// 함수의 파라미터에 타입을 지정
function printMessage(message: string): void {
  console.log(message);
}

// 객체의 타입을 지정하는 방법
let myInfo: { name: string; height: number; isConditionGood: boolean } = {
  name: "seungkyoo",
  height: 179,
  isConditionGood: true,
};

let myInfoWithGender: {
  name: string;
  height: number;
  isConditionGood: boolean;
  gender?: string;
} = {
  name: "seungkyoo",
  height: 179,
  isConditionGood: true,
};

// isCritical 값은 옵션
function printMessageWithAlert(message: string, isCritical?: boolean): void {
  console.log(message);

  if (isCritical) {
    alert(message);
  }
}

console.log(typeof myInfo);
