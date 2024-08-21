require('dotenv').config();
require('../../src/config/mongooseConfig');

const express = require('express');
const http = require('http'); // Import http module
const cors = require('cors');
const routes = require('../../src/routes'); // Import central route file
const expressPino = require('express-pino-logger');
const logger = require('../../src/utils/logger');


const expressLogger = expressPino({ logger });

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app

const allowedDomains = [
    'http://localhost:3000', // Client's domain with port
];

const corsOptions = {
    origin: function (origin, callback) {
        logger.info("Request origin: ", origin); // This line will log the origin of each request

        if (!origin || allowedDomains.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(expressLogger);

// Middleware for raw body parsing for Stripe webhook
app.use('/api/public/stripe/stripe-webhook', express.raw({ type: 'application/json' }));



// Enable CORS for all routes
app.use(cors(corsOptions));
app.use(express.static("sharing"));

// Middleware, error handling, etc...
const PORT = 8080;

app.use(express.json());

app.use('/api', express.static("sharing"));

// Health check endpoint
app.get('/status', (req, res) => {
    res.status(200).send('OK');
});

app.use(routes); // Use centralized route management

// Listen on the HTTP server
server.listen(PORT, () => {
    logger.info(`Server  started on http://localhost:${PORT}`);
});
