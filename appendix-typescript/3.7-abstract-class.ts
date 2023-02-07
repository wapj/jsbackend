abstract class Logger {
 
    prepare() {
        console.log("=======================")
        console.log("로그를 남기기 위한 준비")
    }

    log(message: string) {
        this.prepare();
        this.execute(message);
        this.complete();
    };

    // 추상 메서드는 함수명 앞에 abstract 키워드를 붙이며 구현부가 없다. 
    abstract execute(message: string): void;

    complete() {
        console.log("작업 완료")
        console.log("")
    }
}


class FileLogger extends Logger {
    filename: string;

    constructor(filename:string) {
        super(); // 상속을 받은 경우 생성자에서 super()를 먼저 실행해야한다. 
        this.filename = filename;
    }

    execute(message: string): void {
        // 파일에 직접 쓰지는 않지만 쓴다고 가정
        console.log(`[${this.filename}] > `, message);
    }
}

class ConsoleLogger extends Logger {
    execute(message: string): void {
        console.log(message);
    }
}

const fileLogger = new FileLogger("test.log");
fileLogger.log("파일에 로그 남기기 테스트")


const consoleLogger = new ConsoleLogger();
consoleLogger.log("로그 남기기")
