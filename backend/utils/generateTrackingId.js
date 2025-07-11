const crypto = require('crypto');

function generateTrackingId() {
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  return `TRK-${randomStr}`;
}

module.exports = generateTrackingId;
