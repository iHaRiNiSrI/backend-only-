const Tracking = require('../models/Tracking');

const getTrackingById = async (req, res) => {
  const { trackingId } = req.params;
  try {
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) return res.status(404).json({ message: 'Tracking ID not found' });
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTrackingById };
