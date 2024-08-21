require("dotenv").config();
const stripe = require("stripe")(process.env.NODE_ENV_STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

exports.stripeWebhook = async (req, res) => {
    let event;

    try {
        const sig = req.headers["stripe-signature"];
        // Log the raw body for debugging purposes
        logger.info("Received raw body:", req.body);
        logger.info("Type of received raw body:", typeof req.body);

        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(
            req.body, // Use the raw body of the request
            sig,
            process.env.STRIPE_WEBHOOK_SECRET // Use the environment variable
        );
    } catch (err) {
        logger.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    // Handle the event
    switch (event.type) {
        case "customer.subscription.created":
            const subscriptionCreated = event.data.object;
            // await handleSubscriptionCreated(subscriptionCreated);
            break;
        case "customer.subscription.updated":
            const subscriptionUpdated = event.data.object;
            // await handleSubscriptionUpdated(subscriptionUpdated);
            break;
        case "checkout.session.completed":
            const session = event.data.object;
            // await handleCheckoutSessionCompleted(session);
            break;
        // ... handle other event types
        default:
            logger.info(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
};


exports.requestStripeSession = async (req, res) => {
    const { planName, term } = req.body;
    const userId = req.user.id; // Extracting userId from the request

    // Base URLs for different environments
    const baseUrl = "staging"
    // Path based on the type
    const path = "replyguy"

    // Validate the environment and type
    if (!baseUrl || !path) {
        return res.status(400).json({ error: "Invalid environment or type specified" });
    }

    // Define the price IDs for each plan and term
    const priceIds = {
        professional: {
            monthly: "price_1OYeijDW8rdz0dDLYkOF6WNt",
            annual: "price_1OYeijDW8rdz0dDLbFVv3xNT"
        },
        business: {
            monthly: "price_1OYejKDW8rdz0dDLDEM0QzBc",
            annual: "price_1OYejtDW8rdz0dDLT0jyDydH"
        },
        enterprise: {
            monthly: "price_1OYeijDW8rdz0dDLYkOF6WNt",
            annual: "price_1OYeijDW8rdz0dDLbFVv3xNT"
        }
    };

    // Check if the planName is free
    if (planName === 'free') {
        return res.status(200).json({ message: "Free plan, no session created" });
    }

    // Get the correct price ID based on planName and term
    const priceId = priceIds[planName]?.[term];

    // Handle invalid planName or term
    if (!priceId) {
        return res.status(400).json({ error: "Invalid planName or term specified" });
    }

    const successUrl = `${baseUrl}${path}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}${path}/cancel`;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                user_id: userId,
                plan_name: planName,  // Add planName to metadata
                term: term           // Add term to metadata
            },
        });
        // Return the session ID to the frontend
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        logger.error("Error in requestStripeSession:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};