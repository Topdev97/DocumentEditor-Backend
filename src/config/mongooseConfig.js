// config/mongodbConfig.js
require('dotenv').config();

const mongoose = require("mongoose");
try {
    //Live Mode MongoDB
    // mongoose.connect(process.env.NODE_ENV_MONGODB_LIVE);

    // Development Mode MongoDB
    mongoose.connect(process.env.NODE_ENV_MONGODB_LOCAL);
    console.log('Database Connected!')
} catch (error) {
    console.error(error);
}