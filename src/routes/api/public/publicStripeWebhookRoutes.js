// routes/api/public/publicStripeWebhook.js
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
const stripeController = require('../../../controllers/stripeWebhookController');

// Stripe webhook route with raw body parser
router.post(
    '/stripe-webhook',
    bodyParser.raw({ type: 'application/json' }),
    stripeController.stripeWebhook
);

module.exports = router;