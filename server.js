const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const path = require('path');

// ─── Main App (Socket.io + Static) ────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── PeerJS Server (Signaling) ───────────────────────────────────────────────
const peerServer = ExpressPeerServer(server, {
  debug: false,
  path: '/',
});
app.use('/peerjs', peerServer);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
});

// ─── In-Memory Store (Zero Persistence) ───────────────────────────────────────
// rooms: Map<roomId, { users: Map<socketId, { nickname, peerId }> }>
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { users: new Map() });
  return rooms.get(roomId);
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.users.size === 0) rooms.delete(roomId);
}

function getRoomUserList(room) {
  return Array.from(room.users.values()).map(u => ({
    nickname: u.nickname,
    peerId: u.peerId,
  }));
}

// ─── Socket.io Events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentNickname = null;

  socket.on('join-room', ({ roomId, nickname, peerId }) => {
    if (!roomId || !nickname) return;
    currentRoomId = roomId;
    currentNickname = nickname.trim().substring(0, 32);

    const room = getOrCreateRoom(roomId);
    room.users.set(socket.id, { nickname: currentNickname, peerId });
    socket.join(roomId);

    // Send user list to joiner
    socket.emit('room-users', getRoomUserList(room));

    // Tell everyone else
    socket.to(roomId).emit('user-joined', {
      nickname: currentNickname,
      peerId,
      userCount: room.users.size,
    });

    // System message to room
    io.to(roomId).emit('system-message', {
      text: `${currentNickname} xonaga kirdi`,
      type: 'join',
      timestamp: Date.now(),
    });
  });

  socket.on('chat-message', ({ text }) => {
    if (!currentRoomId || !currentNickname || !text?.trim()) return;
    io.to(currentRoomId).emit('chat-message', {
      nickname: currentNickname,
      text: text.trim().substring(0, 2000),
      timestamp: Date.now(),
    });
  });

  socket.on('typing', (isTyping) => {
    if (!currentRoomId || !currentNickname) return;
    socket.to(currentRoomId).emit('user-typing', { nickname: currentNickname, isTyping });
  });

  socket.on('call-started', ({ callerNickname, type }) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit('call-started', { callerNickname, type });
  });

  socket.on('call-ended', () => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit('call-ended');
  });

  socket.on('disconnect', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.users.delete(socket.id);
    io.to(currentRoomId).emit('user-left', {
      nickname: currentNickname,
      userCount: room.users.size,
    });
    io.to(currentRoomId).emit('system-message', {
      text: `${currentNickname} xonadan chiqdi`,
      type: 'leave',
      timestamp: Date.now(),
    });
    cleanupRoom(currentRoomId);
  });
});
// 1. "public" papkasini statik fayllar uchun ochish
app.use(express.static(path.join(__dirname, 'public')));

// 2. Har qanday yo'nalish bo'yicha index.html ni qaytarish (Single Page App prinsipi)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Anonymous Messenger running on port ${PORT}`);
  console.log('🔒 Zero persistence — all data lives in RAM only\n');
});
