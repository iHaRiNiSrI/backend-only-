const express = require('express');
const { body, validationResult } = require('express-validator');
const { loginUser } = require('../services/loginService');
const { signupUser } = require('../services/signupService');

const router = express.Router();

// ✅ Login Route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('userType').isIn(['customer', 'deliveryPerson']).withMessage('Invalid user type'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType } = req.body;

    try {
      const { user, token } = await loginUser(userType, email, password);
      res.json({ message: 'Login successful', user, token });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }
);

// ✅ Signup Route
router.post(
  '/signup',
  [
    body('userType').isIn(['customer', 'deliveryPerson']).withMessage('Invalid user type'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('location').isArray({ min: 2, max: 2 }).withMessage('Location must be [lng, lat]'),
    body('location[0]').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be valid'),
    body('location[1]').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be valid'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userType, ...userData } = req.body;

    try {
      const newUser = await signupUser(userType, userData);
      const token = require('../utils/generateToken')(newUser._id, userType);

      const userObj = newUser.toObject();
      delete userObj.password;

      res.status(201).json({ message: 'Signup successful', newUser: userObj, token });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;
