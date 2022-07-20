import { Module } from "@nestjs/common";
import { HelloController } from "./hello.controller";

@Module({
  controllers: [HelloController],
})
export class HelloModule {}
