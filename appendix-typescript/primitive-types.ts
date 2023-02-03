const one: number = 1;
const myName: string = "seungkyoo";
const trueOrFalse: boolean = true;
const unIntended: undefined = undefined;
const nullable: null = null;
const bigNumber: bigint = 1234567890123456789012345678901234567890n;
const symbolValue: symbol = Symbol("symbol");

console.log(one + 1);
console.log(myName + " is my name");
console.log(trueOrFalse ? "true" : "false");
console.log(bigNumber / 10000000000000000n);
console.log(symbolValue === Symbol("symbol"));
