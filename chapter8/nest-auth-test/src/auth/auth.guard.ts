import { CanActivate, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(request.cookies['login']);
    // 쿠키가 있으면 인증된 것
    if (request.cookies['login']) {
      return true;
    }

    // 쿠키가 없으면 request의 body의 정보로 인증을 시도
    if (!request.body.email || !request.body.password) {
      return false;
    }

    const user = await this.authService.validateUser(
      request.body.email,
      request.body.password,
    );

    if (!user) {
      return false;
    }
    request.user = user;
    console.dir(request);

    return true;
  }
}
