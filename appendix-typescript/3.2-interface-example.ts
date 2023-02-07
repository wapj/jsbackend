type BookType = {
  title: string;
  price: number;
  author: string;
};

interface Book {
  title: string;
  price: number;
  author: string;
}

let bookType: BookType = {
  title: "백엔드 개발자 되기",
  price: 10000,
  author: "박승규",
};

let book: Book = {
  title: "백엔드 개발자 되기",
  price: 10000,
  author: "박승규",
};

let wrongBookType: BookType = {
  title: "백엔드 개발자 되기",
  price: 10000,
  author: 1234,
};

let wrongBook: Book = {
  title: "백엔드 개발자 되기",
  price: 10000,
  author: 1234,
};

interface Car {
  name: string;
  price: number;
  brand: string;
  options?: string[];
}

let avante: Car = {
  name: "아반떼",
  price: 1500,
  brand: "현대",
  options: ["에어컨", "네비게이션"],
};

let morning: Car = {
  name: "모닝",
  price: 650,
  brand: "기아",
};

interface Citizen {
  id: string;
  name: string;
  region: string;
  readonly age: number;
}

let seungkyoo: Citizen = {
  id: "123456",
  name: "박승규",
  region: "경기",
  age: 40,
};

seungkyoo.age = 39; // Error
