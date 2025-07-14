const kmeans = require('ml-kmeans');
const Order = require('../models/Order');
const DeliveryPerson = require('../models/DeliveryPerson');
const Tracking = require('../models/Tracking');
const haversine = require('haversine-distance');
const { WAREHOUSE_COORDINATES } = require('../config/constants'); // ✅ Step 1: Import warehouse coords

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

      // 4. Find best delivery partner using weighted score
      let bestPartner = null;
      let minScore = Infinity;

      for (const partner of deliveryPartners) {
        const distToCluster = haversine(clusterCenter, partner.location.coordinates);
        const distToWarehouse = haversine(WAREHOUSE_COORDINATES, partner.location.coordinates);

        // Weighted score: prioritize closeness to cluster, then warehouse
        const weightedScore = distToCluster * 0.7 + distToWarehouse * 0.3;

        if (weightedScore < minScore) {
          minScore = weightedScore;
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
