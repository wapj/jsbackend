import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(socket: Socket, data: any): void {
    console.log(socket.id.length);
    this.server.emit(
      'message',
      `client-${socket.id.substring(0, 4)} : ${data}`,
    );
  }
}
