import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // sqlite 설정 메서드
      type: 'sqlite', // ❶ 데이터베이스의 타입
      database: process.env.DATABASE_PATH ?? 'nest-auth-test.sqlite', // ❷ 데이터베이스 파일명
      entities: [User], // ❸ 엔티티 리스트
      synchronize: true, // ❹ 데이터베이스에 스키마를 동기화
      logging: true, // ❺ SQL 실행 로그 확인
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
