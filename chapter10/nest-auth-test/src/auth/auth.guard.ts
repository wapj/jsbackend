import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
    return true;
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: any): Promise<boolean> {
    console.log('guard before canActivate');
    const result = (await super.canActivate(context)) as boolean;
    console.log('result : ' + result);
    console.log('guard after canActivate');
    const request = context.switchToHttp().getRequest();
    console.log(request.session);
    await super.logIn(request); // 세션 옵션이 있으면 _passport.instance.serializeUser() 를 호출하여 세션을 req._passport.session.user 에 저장
    console.log(request.session);
    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    console.log('333');
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: any): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}
