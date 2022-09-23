import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable() // ❶ 프로바이더로 사용
export class AuthService {
  constructor(private userSerivice: UserService) {} // ❷ 생성자에서 UserService를 주입 받음.

  // ❸ 함수내부에 await 구문이 있으므로 async가 필요
  async register(userDto: CreateUserDto) {
    // ❹ 이미가입된 유저가 있는지 체크
    const user = await this.userSerivice.getUser(userDto.email);
    if (user) {
      // ❺ 기가입된 유저가 있다면 에러발생
      throw new HttpException(
        '해당 유저가 이미 있습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ❻ 패드워드 암호화
    const encryptedPassword = bcrypt.hashSync(userDto.password, 10);

    // ❼ 디비에 저장. 저장중 에러가 나면 서버에러 발생
    try {
      const user = await this.userSerivice.createUser({
        ...userDto,
        password: encryptedPassword,
      });
      // ❽회원가입 후 반환하는 값에는 password를 주지 않음
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('서버에러', 500);
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userSerivice.getUser(email);

    if (!user) {
      return null;
    }

    const { password: hashedPassword, ...userInfo } = user;

    if (bcrypt.compareSync(password, hashedPassword)) {
      return userInfo;
    }
    return null;
  }
}
