// v8 업그레이드 관련

// String.prototype.isWellFormed(), String.prototype.toWellFormed() 메서드 추가
let malformedString = "\ud800"; // 잘못 형성된 유니코드 문자열
console.log(malformedString.isWellFormed()); // false
// �로 변경됨
// �는 원래의 데이터가 손상되었거나 유니코드로 변환될 수 없는 문자를 대체하는 데 사용됨

console.log(malformedString.toWellFormed());


// Array 버퍼의 사이즈를 동적으로 변경가능
const buffer = new ArrayBuffer(4, { maxByteLength: 10 });
if (buffer.resizable) {
    console.log("The Buffer can be resized!");
    buffer.resize(8); // resize the buffer
}
console.log(`New Buffer Size: ${buffer.byteLength}`);

// SharedArrayBuffer는 grow 메서드를 사용하여 동적으로 변경가능
const shredBuffer = new SharedArrayBuffer(4, { maxByteLength: 10 });

if (shredBuffer.growable) {
    console.log("The SharedArrayBuffer can grow!");
    shredBuffer.grow(8); // 이름은 grow인데 줄일수 있군?!
}
console.log(`New Shared Buffer Size: ${shredBuffer.byteLength}`);


// Methods that change Array and TypedArray by copy
// 원본 배열을 변경하지 않고 새 배열을 생성하는 메서드
let array = [1, 2, 3, 4];
let newArray = array.with(0, 99); // index 0의 값을 99로 변경한 새 배열 생성
console.log(newArray); // [99, 2, 3, 4]
console.log(array); // 원본 배열은 변경되지 않음: [1, 2, 3, 4]

// RegExp v flag with set notation + properties of strings:
// 이 기능은 정규 표현식에서 새로운 v 플래그를 도입하여 문자 집합 표기법과 문자열의 속성을 확장합니다.
// 하나의 코드로 된 이모지
const re = /^\p{Emoji}$/u;
console.log(re.test('⚽')); // '\u26BD' // true

// 여러개의 유니코드가 결합된(multi code point)이모지
// '\u{1F468}\u{1F3FE}\u200D\u2695\uFE0F' 
//  👨 남성, 🏾 어두운피부색, 조합하는 이모지를 만들때 사용, ⚕의학기호, 컬러이모지임을 뜻함
// \u{1F468}\u{1F3FE}\u200D 이렇게 하면 👨‍⚕️ 남성 의사 이모지가 나옴
console.log(re.test('👨🏾‍⚕️')); // false
const re2 = /^\p{RGI_Emoji}$/v;
console.log(re2.test('⚽')); // true
console.log(re2.test('👨🏾‍⚕️')); // true