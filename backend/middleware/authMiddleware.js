const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const DeliveryPerson = require('../models/DeliveryPerson');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userModel = decoded.userType === 'customer' ? Customer : DeliveryPerson;
    const user = await userModel.findById(decoded.id).select('-password');

    if (!user) throw new Error('User not found');

    req.user = user;
    req.userType = decoded.userType;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

function restrictTo(userType) {
  return (req, res, next) => {
    if (req.userType !== userType) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
