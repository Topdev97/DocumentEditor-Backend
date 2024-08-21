// routes/api/private/index.js
const express = require('express');
const router = express.Router();

// Import individual route files
const stripeRoutes = require('./stripeRoutes');

router.use('/stripe', stripeRoutes);

module.exports = router;
