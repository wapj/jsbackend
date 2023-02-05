// 3.5 클래스의 메서드와 속성

class Hello {
  // 생성자
  constructor() {
    this.sayHello("created");
  }

  // 메서드
  sayHello(message: string) {
    console.log(message);
  }
}

const hello = new Hello();
hello.sayHello("안녕하세요~");

// 사각형 클래스
class Rectangle {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}

const rectangle = new Rectangle(10, 5);
rectangle.getArea();
