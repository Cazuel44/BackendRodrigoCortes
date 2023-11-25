const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/products.controller.js");


router.get("/products", ProductController.getProducts); // obtener todos los productos

router.get("/product/:pid", ProductController.getProductById); // obtener producto por id

router.post("/api/products", ProductController.saveProduct); // crear un producto

router.put("/products/:id", ProductController.updateProduct); // actualizar un producto segun id

router.delete("/products/:id", ProductController.deleteProduct); // eliminar un producto especifico por id 

module.exports = router;