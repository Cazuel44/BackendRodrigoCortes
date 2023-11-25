const express = require("express");
const router = express.Router();
const cartsControllers = require("../controllers/carts.controllers.js");

router.get("/carts/:cid", cartsControllers.getCartById); //obtener un carritoporid
router.get("/api/carts", cartsControllers.getAllCarts); //obtener todos los carritos
router.post("/api/carts", cartsControllers.createCart); //crearuncarrito
router.post("/api/carts/:cid/products", cartsControllers.addProductToCart); //agregar un producto especifico al carrito
router.put("/api/carts/:cid/products/:pid", cartsControllers.updateProductQuantity); //actualizar la cantidad de un producto en el carrito
router.delete("/api/deletecarts/:id", cartsControllers.deleteCartById); // borrar un carrito especifico
router.delete("/api/deleteproductcarts/:cid", cartsControllers.deleteAllProductsInCart); // borrar todos los productos del un carrito
router.delete("/api/carts/:cid/product/:pid", cartsControllers.deleteProductFromCart); // borrar un producto especifico de un carrito especifico

module.exports = router;