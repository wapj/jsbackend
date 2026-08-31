type cup = {
  size: string;
};

type brand = {
  brandName: string;
};

type brandedCup = cup & brand;

let starbucksGrandeSizeCup: brandedCup = {
  brandName: "스타벅스",
  size: "grande",
};

type impossible = number & string;
// @ts-expect-error number and string have no overlapping value.
let testImpossible: impossible = 10; // Error
