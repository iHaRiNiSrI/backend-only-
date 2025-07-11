const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  isAvailable: { type: Boolean, default: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
}, { timestamps: true });

deliveryPersonSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DeliveryPerson', deliveryPersonSchema);
