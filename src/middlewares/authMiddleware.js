// middlewares/authMiddleware.js

const authMiddleware = async (req, res, next) => {
    try {
        // Ensure Authorization token is present
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            throw new Error('Authorization header is missing or not Bearer token.');
        }
        // Proceed to next middleware
        next();
    } catch (error) {
        // Handle Error
        res.status(401).json({ error: 'Unauthorized', message: error.message });
    }
};

module.exports = authMiddleware;
