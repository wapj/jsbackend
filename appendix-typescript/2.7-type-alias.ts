export {};

// 타입 별칭
type nsb = number | string | boolean;

let anyValue: nsb = 10;
anyValue = "hello";
anyValue = true;
anyValue = null;

// 타입 별칭에 null, undefined 추가
type nullableNsb = nsb | null;

let nullableValue: nullableNsb = null;
nullableValue = 20;
nullableValue = "nullable";
nullableValue = false;
nullableValue = undefined;
