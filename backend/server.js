const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { initSocket } = require('./services/socketService');
const cron = require('node-cron');

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

// Init socket.io
initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/track', require('./routes/trackingRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Cron fallback for assignment
const assignOrders = require('./services/optimizerService');
cron.schedule('*/2 * * * *', async () => {
  console.log('⏱️ Running auto-assign cron...');
  await assignOrders();
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
