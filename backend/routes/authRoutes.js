const express = require('express');
const router = express.Router();
const { loginUser } = require('../services/loginService');
const { signupUser } = require('../services/signupService');

router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const user = await loginUser(userType, email, password);
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.post('/signup', async (req, res) => {
  const { userType, ...userData } = req.body;

  try {
    const newUser = await signupUser(userType, userData);
    res.status(201).json({ message: 'Signup successful', newUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
