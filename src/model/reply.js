const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const replySchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    serviceType: {
        type: String
    },
    question: {
        type: String
    },
    replyMessage: {
        type: String
    },
    updatedDate: {
        type: Date,
        required: true,
    },
})

module.exports = mongoose.model("Reply", replySchema);