function echo(message: any) : any {
    console.log(message);
    return message;
}

type phone = {
    name: string,
    price : number,
    brand: string,
}

const myPhone = {name: "iPhone", price: 1000, brand: "Apple"}

echo(1);
echo("안녕");
echo(myPhone);

function genericEcho<T>(message: T) : T {
    console.log(message);
    return message;
}

genericEcho(1) // 없는 경우 컴파일러가 타입 추론 
genericEcho<string>("안녕") // 타입을 명시적으로 지정
genericEcho<any>(myPhone); // any를 타입으로 넣으면 제네릭을 쓸 이유가 없다. 
// genericEcho<string>(myPhone); // 타입이 달라서 에러 발생 