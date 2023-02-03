export {};

const numbers: number[] = [1, 2, 3, 4, 5];
const numbers2: number[] = [6, 7, 8, 9, 10];
const stringArray: Array<string> = ["a", "b", "c", "d", "e"];

// 스프레드 연산자로 합치기 가능
const oneToTen = [...numbers, ...numbers2];
console.log(...oneToTen);

const idols: { name: string; birth: number }[] = [
  { name: "minji", birth: 2004 },
  { name: "hani", birth: 2004 },
  { name: "danielle", birth: 2005 },
  { name: "haerin", birth: 2006 },
  { name: "hyein", birth: 2008 },
];

const gameConsoleArray: Array<{ name: string; launch: number }> = [
  { name: "플레이스테이션5", launch: 2020 },
  { name: "엑스박스 시리즈 X/S", launch: 2020 },
  { name: "닌텐도 스위치", launch: 2017 },
  { name: "스팀덱", launch: 2021 },
];

const myTuple: [string, number] = ["seungkyoo", 179];

// 튜플은 함수의 파라메터가 여러개 일 때 유용
function printMyInfo(label: string, info: [string, number]): void {
  console.log(`[${label}]`, ...info);
}

printMyInfo("튜플 테스트", myTuple);

// 튜플을 리턴하는 함수
function fetchUser(): [string, number] {
  return ["seungkyoo", 179];
}

// 결괏값을 분해해서 받을 수 있음
const [name24, height24] = fetchUser();
console.log(name24, height24);
