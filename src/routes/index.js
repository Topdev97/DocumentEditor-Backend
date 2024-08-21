// routes/index.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');


// Public Routes
const publicApiRoutes = require('./api/public');
router.use('/api/public', publicApiRoutes);

// Private Routes
const privateApiRoutes = require('./api/private');
router.use('/api/private', authMiddleware, privateApiRoutes);

module.exports = router;