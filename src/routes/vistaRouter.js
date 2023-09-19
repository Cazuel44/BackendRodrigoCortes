const express = require("express")
const { isUtf8 } = require("buffer");
const fs = require("fs")
const path = require("path");
const { error } = require("console");
const handlebars = require('express-handlebars');

const router = express.Router()

router.get("/", async (req, res)=>{
    try{
        const contenidoJson = await fs.promises.readFile("products.json", "utf-8"); // revisar await en caso de error
        const productos = JSON.parse(contenidoJson);

        console.log("alo")
        res.render("home", {productos})

    } catch{
        console.log("error al leer el archivo JSON:", error);
    }
});

module.exports = router;

