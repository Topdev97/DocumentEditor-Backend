// routes/api/public/index.js
const express = require('express');
const router = express.Router();

const publicStripeRoutes = require('./publicStripeWebhookRoutes');
const userRoutes = require('./userRoutes'); // Import user routes

router.use('/stripe', publicStripeRoutes);
router.use('/user', userRoutes);

module.exports = router;