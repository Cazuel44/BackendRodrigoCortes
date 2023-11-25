const {cartModel} = require("../models/carts.model.js");
const {productModel} = require("../models/products.model.js");

class CartDao {
    async getCartById(cartId) {
        try {
            const cart = await cartModel.findById(cartId).populate("products").lean();
            return cart;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getAllCarts() {
        try {
            const carts = await cartModel.find();
            return carts;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async createCart(newCart) {
        try {
            const cart = await cartModel.create(newCart);
            return cart;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async addProductToCart(cartId, productIds) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                return { success: false, message: 'Carrito no encontrado' };
            }
            
            const products = await productModel.find({ _id: { $in: productIds } });
            if (products.length !== productIds.length) {
                return { success: false, message: 'Uno o varios productos no se encontraron' };
            }

            cart.products.push(...productIds);
            await cart.save();

            return { success: true, message: 'Producto(s) agregado(s) al carrito' };
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error al agregar producto(s) al carrito' };
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                return { success: false, message: 'Carrito no encontrado' };
            }

            const productIndex = cart.products.findIndex(product => product.toString() === productId);
            if (productIndex === -1) {
                return { success: false, message: 'Producto no encontrado en el carrito' };
            }

            cart.products[productIndex].quantity = newQuantity;
            await cart.save();

            return { success: true, message: 'Cantidad de producto actualizada en el carrito' };
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error al actualizar la cantidad del producto en el carrito' };
        }
    }

    async deleteCartById(cartId) {
        try {
            await cartModel.findByIdAndDelete(cartId);
            return { message: 'Carrito eliminado' };
        } catch (error) {
            console.error(error);
            return { error: 'Error al eliminar el carrito' };
        }
    }

    async deleteAllProductsInCart(cartId) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                return { error: 'Carrito no encontrado' };
            }

            cart.products = [];
            await cart.save();

            return { message: 'Productos eliminados del carrito' };
        } catch (error) {
            console.error(error);
            return { error: 'Error al eliminar los productos del carrito' };
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                return { error: 'Carrito no encontrado' };
            }

            const productIndex = cart.products.findIndex(product => product.toString() === productId);
            if (productIndex === -1) {
                return { error: 'Producto no encontrado en el carrito' };
            }

            const productToDelete = cart.products[productIndex];
            const productPrice = productToDelete.price;

            if (!isNaN(productPrice)) {
                cart.total = (cart.total || 0) - productPrice;
            }

            cart.products.splice(productIndex, 1);
            await cart.save();

            return { message: 'Producto eliminado del carrito' };
        } catch (error) {
            console.error(error);
            return { error: 'Error al eliminar el producto del carrito' };
        }
    }
}

module.exports = CartDao;