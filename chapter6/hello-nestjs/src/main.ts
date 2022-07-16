import { NestFactory } from "@nestjs/core";
import { HelloModule } from "./hello.module";

async function bootstrap() {
  const app = await NestFactory.create(HelloModule);
  await app.listen(3000);
}

bootstrap();
