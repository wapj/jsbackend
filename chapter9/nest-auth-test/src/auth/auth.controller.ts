import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import {
  AuthenticatedGuard,
  GoogleAuthGuard,
  LocalAuthGuard,
  LoginGuard,
} from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth') // ❶ 컨트롤러이며 주소는 auth로 시작
export class AuthController {
  constructor(private authService: AuthService) {} // ❷ AuthService를 주입받는다.

  @Post('register') // ❸ register 주소로 POST로 온 요청을 처리
  // ❹ class-validator 가 자동으로 유효성검증
  async register(@Body() userDto: CreateUserDto) {
    return await this.authService.register(userDto); // ❺ authService를 사용하여 user정보를 저장
  }

  @Post('login')
  async login(@Request() req, @Response() res) {
    const userInfo = await this.authService.validateUser(
      req.body.email,
      req.body.password,
    );

    if (userInfo) {
      res.cookie('login', JSON.stringify(userInfo), {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1day
        // maxAge: 10000,
      });
    }
    return res.send({ message: 'login success' });
  }

  @UseGuards(LoginGuard)
  @Post('login2')
  async login2(@Request() req, @Response() res) {
    if (!req.cookies['login'] && req.user) {
      // 응답에 쿠키정보 추가
      res.cookie('login', JSON.stringify(req.user), {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1day
      });
    }
    return res.send({ message: 'login2 success' });
  }

  @UseGuards(LoginGuard)
  @Get('test-guard')
  testGuard() {
    return '로그인을 한 경우 보입니다.';
  }

  @UseGuards(LocalAuthGuard)
  @Post('login3')
  login3(@Request() req) {
    console.log('login3');
    return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('test-guard2')
  testGuardWithSession(@Request() req) {
    return req.user;
  }

  @Get('to-google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Response() res) {
    const { user } = req;
    // res.redirect('http://localhost:3000/auth/test-guard2');
    return res.send(user);
  }
}
