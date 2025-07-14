const { validationResult } = require('express-validator');
const generateTrackingId = require('../utils/generateTrackingId');
const { queueOrder } = require('../services/queueManager');
const Order = require('../models/Order');
const Tracking = require('../models/Tracking');

// ✅ Place Order (already implemented)
const placeOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

// ✅ New: Update Order Status (for delivery partner)
const updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const orderId = req.params.id;
    const { status, location } = req.body;

    const validStatuses = ['in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only assigned delivery partner can update
    if (!order.deliveryPersonId || order.deliveryPersonId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this order' });
    }

    order.status = status;
    await order.save();

    await Tracking.updateOne(
      { orderId },
      {
        $push: {
          updates: {
            status,
            location: {
              type: 'Point',
              coordinates: location
            },
            timestamp: new Date()
          }
        }
      }
    );

    // If status is delivered, mark partner available
    if (status === 'delivered') {
      const DeliveryPerson = require('../models/DeliveryPerson');
      await DeliveryPerson.findByIdAndUpdate(order.deliveryPersonId, { isAvailable: true });
    }

    res.json({ message: `Order marked as ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { placeOrder, updateOrderStatus };
