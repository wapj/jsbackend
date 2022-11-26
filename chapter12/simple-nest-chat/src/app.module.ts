import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChatGateway } from './app.gateway';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
