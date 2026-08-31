import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Delete,
  ForbiddenException,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  private assertOwnAccount(request, email: string) {
    if (request.user?.email !== email) {
      throw new ForbiddenException('다른 사용자의 정보는 변경할 수 없습니다.');
    }
  }

  @Get('/getUser/:email')
  @UseGuards(AuthenticatedGuard)
  async getUser(@Request() request, @Param('email') email: string) {
    this.assertOwnAccount(request, email);
    const user = await this.userService.getUser(email);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    const { password, ...userInfo } = user;
    return userInfo;
  }

  @Put('/update/:email')
  @UseGuards(AuthenticatedGuard)
  updateUser(
    @Request() request,
    @Param('email') email: string,
    @Body() user: UpdateUserDto,
  ) {
    this.assertOwnAccount(request, email);
    return this.userService.updateUser(email, user);
  }

  @Delete('/delete/:email')
  @UseGuards(AuthenticatedGuard)
  deleteUser(@Request() request, @Param('email') email: string) {
    this.assertOwnAccount(request, email);
    return this.userService.deleteUser(email);
  }
}
