// 모듈과 컨트롤러

import { Controller, Module, Get } from "@nestjs/common";
import { NestFactory } from "@nestjs/core/nest-factory";

@Controller()
class AppController {
  @Get()
  getStart() {
    return "hello nestjs";
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
