import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Button,
  Sheet,
  Typography,
  Chip,
  Snackbar,
  Textarea,
} from '@mui/joy';

interface Message {
  message: string;
  sender: string;
  senderId: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

interface RoomUser {
  socketId: string;
  userId: string;
  email: string;
}

const Chat: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    color: 'neutral' as 'neutral' | 'success' | 'danger',
  });

  // 🔥 Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setSnackbar({
        open: true,
        message: 'No token found. Please login again.',
        color: 'danger',
      });
      return;
    }

    socketRef.current = io('http://localhost:3001', {
      auth: {
        token: token.trim(), // ✅ FIXED LINE
      },
    });

    socketRef.current.on('connect', () => {
      setSnackbar({
        open: true,
        message: 'Connected to chat server',
        color: 'success',
      });

      // Auto join room
      socketRef.current?.emit('join_room', { roomId: 'room1' });
    });

    socketRef.current.on('disconnect', () => {
      setSnackbar({
        open: true,
        message: 'Disconnected from chat server',
        color: 'danger',
      });
    });

    socketRef.current.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on(
      'room_users',
      (data: { users: RoomUser[]; count: number }) => {
        setRoomUsers(data.users);
      }
    );

    socketRef.current.on('error', (error) => {
      setSnackbar({
        open: true,
        message: `Error: ${error}`,
        color: 'danger',
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // 🔥 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    socketRef.current?.emit('send_message', {
      roomId: 'room1',
      message: inputMessage,
    });

    setInputMessage('');
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f0f1f3' }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
        }}
      >
        {/* Header */}
        <Sheet
          sx={{
            p: 2,
            boxShadow: 'sm',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography level="h4">Room: room1</Typography>
            <Typography level="body-sm">
              Users online: {roomUsers.length}
            </Typography>
          </Box>
        </Sheet>

        {/* Users */}
        {roomUsers.length > 0 && (
          <Sheet
            sx={{
              p: 2,
              borderBottom: '1px solid #eee',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {roomUsers.map((user) => (
              <Chip key={user.socketId} color="primary" variant="soft" size="sm">
                {user.email}
              </Chip>
            ))}
          </Sheet>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {messages.length === 0 ? (
            <Typography
              level="body-sm"
              sx={{ textAlign: 'center', color: 'neutral.500', mt: 4 }}
            >
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg, idx) => (
              <Box key={idx}>
                {msg.isSystemMessage ? (
                  <Typography
                    level="body-xs"
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  >
                    {msg.message}
                  </Typography>
                ) : (
                  <Sheet sx={{ p: 1.5, borderRadius: 'lg', bgcolor: '#f0f1f3' }}>
                    <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                      {msg.sender}
                    </Typography>
                    <Typography level="body-sm">{msg.message}</Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Sheet>
                )}
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Sheet sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
            <Textarea
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              minRows={2}
              sx={{ flex: 1 }}
            />
            <Button type="submit" disabled={!inputMessage.trim()}>
              Send
            </Button>
          </Box>
        </Sheet>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        color={snackbar.color}
      >
        {snackbar.message}
      </Snackbar>
    </Box>
  );
};

export default Chat;