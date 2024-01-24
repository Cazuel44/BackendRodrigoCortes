const express = require("express");
const { isUtf8 } = require("buffer");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
const handlebars = require('express-handlebars');
const {productModel} = require("../dao/mongo/models/products.model");
const {userModel} = require("../dao/mongo/models/users.model.js")
const { authToken } = require("../utils.js"); 
const passport = require("passport")
const cartDao = require("../dao/mongo/carts.mongo.js")


const router = express.Router()

const cartDaoInstance = new cartDao();

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

router.get("/register", async (req, res)=>{
    try {
        res.render("register");
    } catch (error) {
        res.status(500).json({ message: "Error al cargar la página" });
    }
});


const PRODUCTS_PER_PAGE = 10; 


//allproducts con JWT
router.get("/allproducts", passport.authenticate("current", { session: false })/* authToken */, async (req, res) => {
    try {
        const nombre = req.user.nombre; // trae el nombre del usuario desde el DTO de la estrategia de passport
        console.log(nombre)

        const page = parseInt(req.query.page) || 1;

        // busca los productos en la bd
        const products = await productModel.find().limit(PRODUCTS_PER_PAGE).lean();
        
        // calcula los productos en la bd
        const totalProducts = await productModel.countDocuments();
        // calcular las páginas
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        const prevPage = page - 1;
        const nextPage = page + 1;
        const prevLink = page > 1; // Verifica si hay un enlace "Anterior"
        const nextLink = page < totalPages;

        res.render("products", {
            productos: products,
            page,
            totalPages,
            nextPage,
            prevPage,
            prevLink,
            nextLink,
            nombre,
        });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
    }
});




router.get("/login", async (req, res)=>{
    try{
        res.render("login",{})
    } catch (error){
        console.log("error al acceder a la vista:", error);
    }
});

router.get("/reset_password/:token", authToken, async (req, res) => {
    try {
        // Acceder al token desde req.params.token
        const token = req.params.token;
        
        // Aquí puedes procesar el token o utilizarlo según tus necesidades
        console.log("Token recibido:", token);

        res.render("recovery", {})
    } catch (error) {
        console.log("error al acceder a la vista:", error);
    }
});
/* router.get("/reset_password", authToken, async (req, res)=>{
    try{
        res.render("recovery",{})
    } catch (error){
        console.log("error al acceder a la vista:", error);
    }
}); */

router.get("/profile", passport.authenticate("current", { session: false }), async (req, res) => {

    const nombre = req.user.nombre;
    const email = req.user.email;
    const rol = req.user.rol;
    
    try {
        // Obtener todos los usuarios de la base de datos
        let users = await userModel.find().lean();

        // Renderizar la vista profile y pasar datos como un objeto
        res.render("profile", {
            nombre: nombre,
            email: email,
            rol: rol,
            users: users // Agregar la lista de usuarios al objeto que se pasa a la vista
        });
    } catch (error) {
        console.log("Error al acceder a la vista de perfil:", error);
    }
});



router.get("/cart/detail/:cartId", async (req, res) => {
    try {
        const cartId = req.params.cartId;
        console.log("Cart ID:", cartId); // Verifica si el cartId está llegando correctamente

        const cartDetails = await cartDaoInstance.getCartById(cartId);
        console.log("Cart Details:", cartDetails); // Verifica los detalles del carrito recuperados

        res.render("cartDetail", { cart: cartDetails });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ message: "Error al cargar la página" });
    }
});


module.exports = router;

