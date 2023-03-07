import { IsEmail, IsString } from 'class-validator'; // ❶ IsEmail, IsString 임포트

// ❷ email, password, username 필드를 만들고 데코레이터를 붙이기
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;
}

// ❸ 업데이트의 유효성 검증 시 사용할 DTO
export class UpdateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
