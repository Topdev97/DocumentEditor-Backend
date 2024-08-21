// routes/api/public/stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../../../controllers/stripeWebhookController.js');

router.post('/create-checkout-session', stripeController.requestStripeSession);

module.exports = router;