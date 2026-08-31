import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable() // ❶ DI를 위한 데코레이터
export class UserService {
  // ❷ 리포지터리 주입
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // ❸ 유저 생성
  createUser(user): Promise<User> {
    return this.userRepository.save(user);
  }

  // ❹ 한 명의 유저 정보 찾기
  async getUser(email: string) {
    const result = await this.userRepository.findOne({
      where: { email },
    });
    return result;
  }

  // ❺ 유저 정보 업데이트. username과 password만 변경
  async updateUser(email, _user) {
    const user: User = await this.getUser(email);
    user.username = _user.username;
    user.password = await bcrypt.hash(_user.password, 10);
    const savedUser = await this.userRepository.save(user);
    savedUser.password = undefined;
    return savedUser;
  }

  // ❻ 유저 정보 삭제
  deleteUser(email: any) {
    return this.userRepository.delete({ email });
  }
}
