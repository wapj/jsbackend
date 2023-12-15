// calculator.test.js

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import Calculator from "./calculator.js";

// calculator 테스트 블록
describe("Calculator", () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  test("adds two numbers", () => {
    assert.equal(calc.add(2, 3), 5);
  });

  test.skip("subtracts two numbers", () => {
    assert.equal(calc.subtract(5, 3), 2);
  });

  test("multiplies two numbers", () => {
    assert.equal(calc.multiply(2, 3), 6);
  });

  test("divides two numbers", () => {
    assert.equal(calc.divide(6, 2), 3);
  });

  test("throws error when dividing by zero", () => {
    assert.throws(() => calc.divide(5, 0), Error);
  });
});
