const jwt = require('jsonwebtoken');
const DeliveryPerson = require('../models/DeliveryPerson');

let ioInstance = null;

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: { origin: '*' },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || !token.startsWith('Bearer ')) {
      return next(new Error('Unauthorized: No token provided'));
    }

    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

      if (decoded.userType !== 'deliveryPerson') {
        return next(new Error('Unauthorized: Not a delivery partner'));
      }

      const user = await DeliveryPerson.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Unauthorized: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id, '| Delivery:', socket.user.name);

    socket.on('subscribe', () => {
      socket.join(`room-${socket.user._id}`);
    });

    socket.on('locationUpdate', ({ coords }) => {
      io.to(`room-${socket.user._id}`).emit(`location-${socket.user._id}`, coords);
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
