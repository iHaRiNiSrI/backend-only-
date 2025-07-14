const Tracking = require('../models/Tracking');
const DeliveryPerson = require('../models/DeliveryPerson');

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



const getLatestTrackingStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({ message: 'Tracking ID not found' });
    }

    const latestUpdate = tracking.updates?.[tracking.updates.length - 1];
    if (!latestUpdate) {
      return res.status(200).json({ status: 'pending', message: 'No updates yet' });
    }

    const deliveryPerson = tracking.deliveryPersonId
      ? await DeliveryPerson.findById(tracking.deliveryPersonId).select('name phone location')
      : null;

    res.json({
      trackingId,
      orderId: tracking.orderId,
      status: latestUpdate.status,
      location: latestUpdate.location,
      timestamp: latestUpdate.timestamp,
      deliveryPerson
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTrackingById,
  getLatestTrackingStatus
};

