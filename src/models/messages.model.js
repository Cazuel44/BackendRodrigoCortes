const mongoose = require("mongoose");

const messagesCollection = "messages";

const messageSchema = new mongoose.Schema({
    user: {type: String, max: 100, required: true},
    message: {type: String, max: 300, required: true},
});

const messsageModel = mongoose.model(messagesCollection, messageSchema)

module.exports = {messsageModel}