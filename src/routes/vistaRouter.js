const express = require("express");
const { isUtf8 } = require("buffer");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
const handlebars = require('express-handlebars');
const {productModel} = require("../models/products.model");


const router = express.Router()

router.get("/", async (req, res)=>{
    try{
        const contenidoJson = await fs.promises.readFile("products.json", "utf-8"); // revisar await en caso de error
        const productos = JSON.parse(contenidoJson);

        console.log("alo")
        res.render("home", {/* productos */})

    } catch{
        console.log("error al leer el archivo JSON:", error);
    }
});


const PRODUCTS_PER_PAGE = 10; 

router.get("/allproducts", async (req, res)=>{

    
    try {
        const page = parseInt(req.query.page) || 1; // pagina actual y si no se especifica una pagina por defecto es 1
        

        // busca los productos en la bd
        const products = await productModel.find()/* .skip((page - 1) * PRODUCTS_PER_PAGE) */.limit(PRODUCTS_PER_PAGE).lean();
        console.log(products)
        // calcula los productos en la bd
        const totalProducts = await productModel.countDocuments();
        // calcular las paginas
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        const prevPage = page - 1
        const nextPage = page + 1;
        const prevLink = page > 1; // Verifica si hay un enlace "Anterior"
        const nextLink = page < totalPages;
        res.render("products", { productos: products, page, totalPages, nextPage, prevPage, prevLink, nextLink });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
        console.log(error)
    }
    
});






module.exports = router;

