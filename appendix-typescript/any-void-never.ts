export {};

let anyValue: any = 10;
print(anyValue);
anyValue = "hello";
print(anyValue);
anyValue = true;
print(anyValue);

function print(value: any): void {
  console.log(value);
}

function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
