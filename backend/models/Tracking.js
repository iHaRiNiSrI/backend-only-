const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  trackingId: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson' },
  updates: [
    {
      status: {
        type: String,
        enum: ['pending', 'assigned', 'in_transit', 'delivered'],
      },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

trackingSchema.index({ trackingId: 1 });
trackingSchema.index({ "updates.location": "2dsphere" });

module.exports = mongoose.model('Tracking', trackingSchema);