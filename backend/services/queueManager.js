const orderQueue = [];
const Order = require('../models/Order');
const Tracking = require('../models/Tracking');
const assignOrders = require('./optimizerService');

const MAX_ORDERS = 10;

async function queueOrder(orderData) {
  orderQueue.push(orderData);

  if (orderQueue.length >= MAX_ORDERS) {
    await processQueue();
  }
}

async function processQueue() {
  if (orderQueue.length === 0) return;

  const savedOrders = await Order.insertMany([...orderQueue]);
  orderQueue.length = 0;

  await Tracking.insertMany(savedOrders.map(order => ({
    trackingId: order.trackingId,
    orderId: order._id,
    updates: [{ status: 'pending', location: order.location }]
  })));

  await assignOrders();
}

function processQueueDirectly() {
  return processQueue();
}

module.exports = { queueOrder, processQueueDirectly };
