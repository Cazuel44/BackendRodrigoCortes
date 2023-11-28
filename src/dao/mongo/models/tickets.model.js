const mongoose = require("mongoose");
const {cartModel} = require("../models/carts.model.js")

const ticketsCollection = "tickets";

const ticketSchema = new mongoose.Schema(
    {
        code: { type: String, max: 100, unique: true, required: true },
        purchaser: { type: String, max: 30, required: true }, // correo de quien compra
    },
    { timestamps: { createdAt: "purchase_datetime" } }
);

// Método para calcular el total del carrito
ticketSchema.methods.calculateTotalAmount = async function () {
    let totalAmount = 0;

    try {
        // Encontrar el carrito asociado a este ticket
        const cart = await cartModel.findOne({ products: { $in: this._id } }).populate('products');

        if (cart) {
            cart.products.forEach((product) => {
                totalAmount += product.price;
            });
        }

        this.amount = totalAmount;
    } catch (error) {
        console.error('Error calculating total amount:', error);
    }
};

ticketSchema.pre("save", async function (next) {
    // Antes de guardar, si el código no está establecido, se genera uno único
    if (!this.code) {
        this.code = generateUniqueCode();
    }
    // Si el amount no está establecido, se calcula el total del carrito
    if (!this.amount) {
        await this.calculateTotalAmount();
    }
    next();
});

function generateUniqueCode() {
    return require('uuid').v4();
}

const ticketModel = mongoose.model(ticketsCollection, ticketSchema);

module.exports = { ticketModel };