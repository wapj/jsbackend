import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BoardController } from "./board/board.controller";
import { Board, BoardSchema } from './board/schemas/board.scheme';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://mymongo:test1234@cluster0.c4xru.mongodb.net/board2'),
    MongooseModule.forFeature([{name: "board", schema: BoardSchema}])
  ],
  controllers: [AppController, BoardController],
  providers: [AppService],
})
export class AppModule {}

// mongodb+srv://mymongo:test1234@cluster0.c4xru.mongodb.net/test