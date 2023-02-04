function echo(message: string): string {
  console.log(message);
  return message;
}

const funcEcho: (message: string) => string = echo;
funcEcho("test");

type FuncEcho = (message: string) => string;
const funcEcho2: FuncEcho = echo;
funcEcho2("test2");

type FuncEcho3 = {
  (message: string): string;
};
const funcEcho3: FuncEcho3 = echo;
funcEcho3("test3");
// funcEcho3(123); // 타입 에러
