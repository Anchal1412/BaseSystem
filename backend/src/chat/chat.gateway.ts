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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  private getClientData(client: Socket): SocketData {
    return client.data as SocketData;
  }

  // 🔥 HANDLE CONNECTION (JWT AUTH)
  handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth.token as string;

      if (!token) {
        console.log('No token provided');
        client.disconnect();
        return;
      }

      // ✅ Clean token (important fix)
      token = token.replace(/'/g, '').trim();

      const payload = this.jwtService.verify<JwtPayload>(token);

      const data = client.data as SocketData;
      data.userId = payload.sub;
      data.email = payload.email;

      console.log(`✅ User connected: ${payload.email}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ WebSocket Auth Error:', errMsg);
      client.disconnect();
    }
  }

  // 🔥 HANDLE DISCONNECT
  handleDisconnect(client: Socket) {
    const data = this.getClientData(client);

    console.log(`❌ User disconnected: ${data?.email}`);

    this.chatService.removeUserFromAllRooms(client.id);
  }

  // 🔥 JOIN ROOM
  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, payload: { roomId: string }) {
    const { roomId } = payload;
    const clientData = this.getClientData(client);

    if (!roomId) return;

    client.join(roomId);

    this.chatService.addUserToRoom(roomId, {
      socketId: client.id,
      userId: clientData.userId,
      email: clientData.email,
    });

    // System message
    this.server.to(roomId).emit('receive_message', {
      message: `${clientData.email} joined the room`,
      sender: 'System',
      senderId: 'system',
      timestamp: new Date(),
      isSystemMessage: true,
    });

    // Send updated users list
    const roomUsers = this.chatService.getRoomUsers(roomId);
    this.server.to(roomId).emit('room_users', {
      users: roomUsers,
      count: roomUsers.length,
    });

    console.log(`👤 ${clientData.email} joined room ${roomId}`);
  }

  // 🔥 LEAVE ROOM
  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    const { roomId } = payload;
    const clientData = this.getClientData(client);

    client.leave(roomId);
    this.chatService.removeUserFromRoom(roomId, client.id);

    this.server.to(roomId).emit('receive_message', {
      message: `${clientData.email} left the room`,
      sender: 'System',
      senderId: 'system',
      timestamp: new Date(),
      isSystemMessage: true,
    });

    const roomUsers = this.chatService.getRoomUsers(roomId);
    this.server.to(roomId).emit('room_users', {
      users: roomUsers,
      count: roomUsers.length,
    });

    console.log(`🚪 ${clientData.email} left room ${roomId}`);
  }

  // 🔥 SEND MESSAGE
  @SubscribeMessage('send_message')
  handleSendMessage(
    client: Socket,
    payload: { roomId: string; message: string },
  ) {
    const { roomId, message } = payload;
    const clientData = this.getClientData(client);

    if (!message.trim()) return;

    const messageData = {
      message,
      sender: clientData.email,
      senderId: clientData.userId,
      timestamp: new Date(),
      isSystemMessage: false,
    };

    this.server.to(roomId).emit('receive_message', messageData);

    console.log(`💬 ${clientData.email} in ${roomId}: ${message}`);
  }

  // 🔥 GET USERS IN ROOM
  @SubscribeMessage('get_room_users')
  handleGetRoomUsers(client: Socket, payload: { roomId: string }) {
    const { roomId } = payload;

    const users = this.chatService.getRoomUsers(roomId);

    client.emit('room_users', {
      users,
      count: users.length,
    });
  }
}
