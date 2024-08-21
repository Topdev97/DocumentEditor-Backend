const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
    },
    fullName: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    zipcode: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    recoveryPasscode: {
        type: String
    },
    zipcode: {
        type: String
    },
    updatedDate: {
        type: Date,
        required: true,
    },
})

module.exports = mongoose.model("User", userSchema);