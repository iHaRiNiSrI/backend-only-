const express = require('express');
const router = express.Router();
const {
  getTrackingById,
  getLatestTrackingStatus
} = require('../controllers/trackingController');

// 📦 GET full tracking info
router.get('/:trackingId', getTrackingById);

// 📍 GET latest tracking status + location
router.get('/:trackingId/latest', getLatestTrackingStatus);

module.exports = router;
