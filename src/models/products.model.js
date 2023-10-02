const mongoose = require("mongoose");

const productsCollection = "products";

const productSchema = new mongoose.Schema({
    title: {type: String, max: 100, required: true},
    description: {type: String, max: 100, required: true},
    code: {type: String, max: 100, required: true},
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    category: {type: String, max: 100, required: true},
    thumbnails: {type: String, max: 100, required: true}
});

const productModel = mongoose.model(productsCollection, productSchema)

module.exports = {productModel}
