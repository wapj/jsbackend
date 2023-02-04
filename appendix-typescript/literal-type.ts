type CoffeeSize = "small" | "medium" | "large";

let myCoffeeSize: CoffeeSize = "small";
let starbucksCoffeeSize: CoffeeSize = "tall"; // 타입에러

type OneToFive = 1 | 2 | 3 | 4 | 5;
const rightNumber: OneToFive = 1;
const wrongNumber: OneToFive = 6; // 타입에러
