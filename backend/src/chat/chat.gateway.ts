import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface SocketData {
  userId: string;
  email: string;
}

interface JwtPayload {
  sub: string;
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  private getClientData(client: Socket): SocketData {
    return client.data as SocketData;
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string | undefined;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      const data = client.data as SocketData;
      data.userId = payload.sub;
      data.email = payload.email;

      console.log(`User ${payload.email} (${client.id}) connected`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('WebSocket connection error:', errorMessage);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const data = this.getClientData(client);
    console.log(`User ${data.email} (${client.id}) disconnected`);
    this.chatService.removeUserFromAllRooms(client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, data: { roomId: string }) {
    const { roomId } = data;
    const clientData = this.getClientData(client);
    const userId = clientData.userId;
    const email = clientData.email;

    // Join the socket to the room
    client.join(roomId);

    // Add user to room in service
    this.chatService.addUserToRoom(roomId, {
      socketId: client.id,
      userId,
      email,
    });

    // Notify other users in the room
    this.server.to(roomId).emit('receive_message', {
      message: `${email} joined the room`,
      sender: 'System',
      senderId: 'system',
      timestamp: new Date(),
      isSystemMessage: true,
    });

    // Send current room users to all clients in the room
    const roomUsers = this.chatService.getRoomUsers(roomId);
    this.server.to(roomId).emit('room_users', {
      users: roomUsers,
      count: roomUsers.length,
    });

    console.log(`User ${email} joined room ${roomId}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, data: { roomId: string }) {
    const { roomId } = data;
    const clientData = this.getClientData(client);
    const email = clientData.email;

    client.leave(roomId);
    this.chatService.removeUserFromRoom(roomId, client.id);

    // Notify other users
    this.server.to(roomId).emit('receive_message', {
      message: `${email} left the room`,
      sender: 'System',
      senderId: 'system',
      timestamp: new Date(),
      isSystemMessage: true,
    });

    // Update room users
    const roomUsers = this.chatService.getRoomUsers(roomId);
    this.server.to(roomId).emit('room_users', {
      users: roomUsers,
      count: roomUsers.length,
    });

    console.log(`User ${email} left room ${roomId}`);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(client: Socket, data: { roomId: string; message: string }) {
    const { roomId, message } = data;
    const clientData = this.getClientData(client);
    const userId = clientData.userId;
    const email = clientData.email;

    const messagePayload = {
      message,
      sender: email,
      senderId: userId,
      timestamp: new Date(),
      isSystemMessage: false,
    };

    // Broadcast to all users in the room
    this.server.to(roomId).emit('receive_message', messagePayload);

    console.log(`Message from ${email} in room ${roomId}: ${message}`);
  }

  @SubscribeMessage('get_room_users')
  handleGetRoomUsers(client: Socket, data: { roomId: string }) {
    const { roomId } = data;
    const roomUsers = this.chatService.getRoomUsers(roomId);

    client.emit('room_users', {
      users: roomUsers,
      count: roomUsers.length,
    });
  }
}
