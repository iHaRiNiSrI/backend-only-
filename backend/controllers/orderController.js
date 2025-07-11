const generateTrackingId = require('../utils/generateTrackingId');
const { queueOrder } = require('../services/queueManager');

const placeOrder = async (req, res) => {
  try {
    const { customerId, items, location } = req.body;

    const trackingId = generateTrackingId();

    const orderData = {
      customerId,
      items,
      location: {
        type: 'Point',
        coordinates: location
      },
      trackingId
    };

    await queueOrder(orderData);

    res.status(201).json({
      message: 'Order placed successfully!',
      trackingId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { placeOrder };
