import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  handleDisconnect(client: any) {
    console.log('Client disconnected');
    console.log(client.id);
  }
  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected');
    console.log(client.id);
  }
  afterInit() {
    console.log('Server initialized');
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    const { message, nickname } = data;
    // this.server.emit('message', { message: `${nickname}: ${message}` });
    socket.broadcast.emit('message', { message: `${nickname}: ${message}` });
  }
}

@WebSocketGateway({ namespace: 'room' })
export class RoomGateway {
  constructor(private readonly chatGateway: ChatGateway) {}

  rooms = [];

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createRoom')
  handleMessage(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    const { nickname, room } = data;
    console.log(data);
    this.chatGateway.server.emit('notice', {
      message: `${nickname}님이 ${room}방을 만들었습니다. `,
    });
    this.rooms.push(room);
    this.server.emit('rooms', this.rooms);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    const { nickname, room, toLeaveRoom } = data;
    console.log(data);
    socket.leave(toLeaveRoom);
    this.chatGateway.server.emit('notice', {
      message: `${nickname}님이 ${room}방에 입장했습니다. `,
    });
    socket.join(room);
  }

  @SubscribeMessage('message')
  handleMessageToRoom(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    const { nickname, room, message } = data;
    console.log(data);
    socket.broadcast.to(room).emit('message', {
      message: `${nickname}: ${message}`,
    });
  }
}
