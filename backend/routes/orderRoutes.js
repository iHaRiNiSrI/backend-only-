const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { placeOrder, updateOrderStatus } = require('../controllers/orderController');

// GET /api/orders/assigned  – delivery partner’s active jobs
router.get(
  '/assigned',
  protect,
  restrictTo('deliveryPerson'),
  async (req, res) => {
    try {
      const Order = require('../models/Order');

      const orders = await Order.find({
        deliveryPersonId: req.user._id,
        status: { $in: ['assigned', 'in_transit'] }
      }).select('-__v');          // strip Mongoose metadata

      res.json({ count: orders.length, orders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// ✅ Place Order (Customer only)
router.post(
  '/place',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.name').notEmpty().withMessage('Item name is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('location').isArray({ min: 2, max: 2 }).withMessage('Location must be [lng, lat]'),
    body('location[0]').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be valid'),
    body('location[1]').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be valid'),
  ],
  placeOrder
);

// ✅ Update Order Status (Delivery partner only)
router.patch(
  '/:id/status',
  protect,
  restrictTo('deliveryPerson'),
  [
    body('status')
      .isIn(['in_transit', 'delivered'])
      .withMessage('Status must be either in_transit or delivered'),
    body('location').isArray({ min: 2, max: 2 }).withMessage('Location must be [lng, lat]'),
    body('location[0]').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be valid'),
    body('location[1]').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be valid'),
  ],
  updateOrderStatus
);

module.exports = router;
