import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('user') // ❶ 컨트롤러 설정 데코레이터
export class UserController {
  constructor(private userService: UserService) {} // ❷ 유저 서비스를주입

  @Post('/create')
  createUser(@Body() user: CreateUserDto) {
    // ❸ 유저 생성
    return this.userService.createUser(user);
  }

  @Get('/getUser/:email')
  async getUser(@Param('email') email: string) {
    // ❹ 한 명의 유저 찾기
    const user = await this.userService.getUser(email);
    console.log(user);
    return user;
  }

  @Put('/update/:email')
  updateUser(@Param('email') email: string, @Body() user: UpdateUserDto) {
    // ❺ 유저 정보 업데이트
    return this.userService.updateUser(email, user);
  }

  @Delete('/delete/:email')
  deleteUser(@Param('email') email: string) {
    // ❻ 유저 삭제
    return this.userService.deleteUser(email);
  }
}
