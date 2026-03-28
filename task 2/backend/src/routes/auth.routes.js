const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

// @route POST /api/auth/login
router.post('/login', login);

// @route GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
