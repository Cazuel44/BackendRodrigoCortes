const mongoose = require("mongoose");

const cartsCollection = "carts";

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
    total: {type: Number, required: true}
    
});

const cartModel = mongoose.model(cartsCollection, cartSchema)

module.exports = {cartModel}