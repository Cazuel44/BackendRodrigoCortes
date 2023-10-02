const mongoose = require("mongoose");

const cartsCollection = "carts";

const cartSchema = new mongoose.Schema({
    description: {type: String, max: 50, required: true},
    quantity: {type: Number, required: true},
    total: {type: Number, required: true}
});

const cartModel = mongoose.model(cartsCollection, cartSchema)

module.exports = {cartModel}