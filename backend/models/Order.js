const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson' },
  trackingId: { type: String, required: true, unique: true },
  items: [
    {
      name: String,
      quantity: Number
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'delivered'],
    default: 'pending'
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // destination of delivery
  },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);