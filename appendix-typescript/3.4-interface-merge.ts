interface Clock {
  time: Date;
}

interface Clock {
  brand: string;
}

interface Clock {
  price: number;
}

/**
 * 내부적으로는 다음과 같이 정의가 병합된다.
 *
 * interface Clock {
 *   time: Date;
 *   brand: string;
 *   price: number;
 * }
 *
 */

const wrongClock: Clock = {
  time: new Date(),
};

const clock: Clock = {
  time: new Date(),
  brand: "놀렉스",
  price: 10000,
};
