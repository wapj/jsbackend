type Constructor = new (...args: any[]) => {};
function HelloDecorator<T extends Constructor>(constructor: T) {
  console.log(constructor);
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log(`Hello Decorator`);
    }
  };
}

@HelloDecorator
class DecoratorTest {
  constructor() {
    console.log(`인스턴스 생성됨`);
  }
}

// const decoTest = new DecoratorTest();

// console.time("실행 시간");
// execute();
function execute() {
  setTimeout(() => {
    console.log(`실행`);
    console.timeEnd("실행 시간");
  }, 500);
}

function Timer() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.time(`Elapsed time`);
      const result = originalMethod.apply(this, args);  // 이 때의 this는 클래스의 인스턴스
      console.timeEnd(`Elapsed time`);
      return result;
    };
  };
}

class ElapsedTime {
  someVar = "test";

  @Timer()
  hello() {
    console.log(`Hello`);
  }
}

new ElapsedTime().hello();

function NamedTimer(label: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.time(label);
      const result = originalMethod.apply(this, args);
      console.timeEnd(label);
      return result;
    };
  };
}

class NamedElapsedTime {
  @NamedTimer(`헬로 시간 측정`)
  hello() {
    console.log(`Hello`);
  }
}

new NamedElapsedTime().hello();