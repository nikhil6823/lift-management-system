import jwt from 'jsonwebtoken';

export function registerLocationSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user.role === 'admin') socket.join('admins');
    socket.join(`user:${socket.user.sub}`);
    socket.on('location:ping', (payload) => {
      if (socket.user.role === 'employee') io.to('admins').emit('location:update', { ...payload, userId: socket.user.sub, recordedAt: new Date() });
    });
  });
}
