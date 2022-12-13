import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  createUser(user): Promise<User> {
    return this.userRepository.save(user);
  }

  async getUser(email: string) {
    const result = await this.userRepository.findOne({
      where: { email },
    });
    console.log(result);
    return result;
  }

  // username과 password만 변경 가능
  async updateUser(email, _user) {
    const user: User = await this.getUser(email);
    console.log(_user);
    user.username = _user.username;
    user.password = _user.password;
    console.log(user);
    this.userRepository.save(user);
  }

  deleteUser(email: any) {
    return this.userRepository.delete({ email });
  }

  async findByEmailOrSave(email, username, providerId): Promise<User> {
    const foundUser = await this.getUser(email);
    if (foundUser) {
      return foundUser;
    }

    const newUser = await this.userRepository.save({
      email,
      username,
      providerId,
    });
    return newUser;
  }
}
