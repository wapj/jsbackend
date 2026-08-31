import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userSerivice: UserService) {
    super();
  }

  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    console.log('serialise');
    console.log(user.email);
    done(null, user.email); // 세션에 저장할 정보
  }

  async deserializeUser(
    payload: any,
    done: (err: Error, payload: any) => void,
  ): Promise<any> {
    console.log('deserialise');
    console.log(payload);

    const user = await this.userSerivice.getUser(payload);
    if (!user) {
      done(new Error('No User'), null);
      return;
    }
    const { password, ...userInfo } = user;
    done(null, userInfo); // 세션에서 가져온 정보로 유저정보를 반환
  }
}
