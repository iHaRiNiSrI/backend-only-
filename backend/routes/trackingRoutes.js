const express = require('express');
const router = express.Router();
const { getTrackingById } = require('../controllers/trackingController');

router.get('/:trackingId', getTrackingById);

module.exports = router;
