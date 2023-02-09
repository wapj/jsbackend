interface ICheckLength {
    length: number;
}

function echoWithLength<T extends ICheckLength>(message: T){
    console.log(message);
}

echoWithLength("Hello");
echoWithLength([1,2,3]);
echoWithLength({length: 10});
// echoWithLength(10); // number는 length가 없기 때문에 에러 발생


// 문자열과 숫자만 지원하는 echoWithLength2 함수
function echoWithLength2<T extends string | number>(message: T){
    console.log(message);
}

echoWithLength2("Hello");
echoWithLength2(10);
// echoWithLength2([1,2,3]); // 배열은 문자열과 숫자가 아니기 때문에 에러 발생