

const Customer = require('../models/Customer');
const DeliveryPerson = require('../models/DeliveryPerson');

async function loginUser(userType, email, password) {
  let userModel = userType === 'customer' ? Customer : DeliveryPerson;
  const user = await userModel.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }

  return user;
}

module.exports = { loginUser };
