

const Customer = require('../models/Customer');
const DeliveryPerson = require('../models/DeliveryPerson');

async function signupUser(userType, userData) {
  let userModel = userType === 'customer' ? Customer : DeliveryPerson;

 
  const exists = await userModel.findOne({ email: userData.email });
  if (exists) throw new Error('User already exists');

  const newUser = new userModel(userData);
  await newUser.save();
  return newUser;
}

module.exports = { signupUser };
