const Customer = require('../models/Customer');
const DeliveryPerson = require('../models/DeliveryPerson');
const generateToken = require('../utils/generateToken');

async function loginUser(userType, email, password) {
  const userModel = userType === 'customer' ? Customer : DeliveryPerson;
  const user = await userModel.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }

  const userObj = user.toObject();
  delete userObj.password;

  const token = generateToken(user._id, userType);

  return { user: userObj, token };
}

module.exports = { loginUser };
