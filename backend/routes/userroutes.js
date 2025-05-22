const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');

// Register user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Get all users (admin only) - DIUBAH KE GET dengan query parameter
router.get('/admin/all', userController.getAllUsers);

module.exports = router;