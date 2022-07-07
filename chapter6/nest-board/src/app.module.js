import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BoardController } from "./board/board.controller";

@Module({
  imports: [],
  controllers: [AppController, BoardController],
  providers: [AppService],
})
export class AppModule {}
