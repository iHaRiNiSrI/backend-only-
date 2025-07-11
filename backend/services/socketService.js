let ioInstance = null;

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('subscribe', ({ partnerId }) => {
      socket.join(`room-${partnerId}`);
    });

    socket.on('locationUpdate', ({ deliveryPersonId, coords }) => {
      io.to(`room-${deliveryPersonId}`).emit(`location-${deliveryPersonId}`, coords);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  ioInstance = io;
}

function getSocketInstance() {
  return ioInstance;
}

module.exports = { initSocket, getSocketInstance };
