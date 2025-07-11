const kmeans = require('ml-kmeans');
const Order = require('../models/Order');
const DeliveryPerson = require('../models/DeliveryPerson');
const Tracking = require('../models/Tracking');
const haversine = require('haversine-distance');

const assignOrders = async () => {
  try {
    // 1. Get all unassigned orders
    const orders = await Order.find({ status: 'pending' });
    if (orders.length === 0) return;

    const orderCoords = orders.map(o => o.location.coordinates);

    // 2. Get available delivery partners
    const deliveryPartners = await DeliveryPerson.find({ isAvailable: true });
    if (deliveryPartners.length === 0) {
      console.log('❗ No available delivery partners');
      return;
    }

    // 3. Cluster orders using KMeans
    const k = Math.min(deliveryPartners.length, Math.ceil(orders.length / 3));
    const { clusters, centroids } = kmeans(orderCoords, k);

    for (let i = 0; i < k; i++) {
      // Get orders in this cluster
      const clusterOrders = orders.filter((_, idx) => clusters[idx] === i);
      const clusterCenter = centroids[i].centroid;

      // 4. Find nearest available delivery partner
      let minDist = Infinity;
      let bestPartner = null;

      for (const partner of deliveryPartners) {
        const dist = haversine(clusterCenter, partner.location.coordinates);
        if (dist < minDist) {
          minDist = dist;
          bestPartner = partner;
        }
      }

      // 5. Assign orders to the selected partner
      if (bestPartner) {
        for (const order of clusterOrders) {
          order.deliveryPersonId = bestPartner._id;
          order.status = 'assigned';
          await order.save();

          // Update tracking info
          await Tracking.updateOne(
            { trackingId: order.trackingId },
            {
              $push: {
                updates: {
                  status: 'assigned',
                  location: {
                    type: 'Point',
                    coordinates: bestPartner.location.coordinates
                  },
                  timestamp: new Date()
                }
              }
            }
          );

          // OPTIONAL: emit to delivery partner via socket
          // io.to(`room-${bestPartner._id}`).emit('new-assignment', { order });
        }

        // Mark delivery partner unavailable
        bestPartner.isAvailable = false;
        await bestPartner.save();
      }
    }
    console.log('✅ Orders successfully assigned');
  } catch (err) {
    console.error('Error in assignOrders:', err);
  }
};

module.exports = assignOrders;
