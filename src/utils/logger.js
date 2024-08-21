// logger.js
const pino = require('pino');

// Define Pino options
const options = {
    level: process.env.LOG_LEVEL || 'info',
};

// Check if you're not in production, then add pino-pretty as a transport
if (process.env.NODE_ENV !== 'production') {
    options.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true // Enables colorized output
        }
    };
}

const logger = pino(options);

module.exports = logger;