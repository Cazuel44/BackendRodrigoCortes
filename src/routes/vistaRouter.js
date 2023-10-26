const express = require("express");
const { isUtf8 } = require("buffer");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
const handlebars = require('express-handlebars');
const {productModel} = require("../models/products.model.js");


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

router.get("/register", async (req, res)=>{
    try {
        res.render("register");
    } catch (error) {
        res.status(500).json({ message: "Error al cargar la página" });
    }
});


const PRODUCTS_PER_PAGE = 10; 


//allproducts antiguo
/* router.get("/allproducts", async (req, res)=>{

    
    try {
        
        const nombre = req.session.nombreUsuario;
        const apellido = req.session.apellidoUsuario;
        const page = parseInt(req.query.page) || 1; // pagina actual y si no se especifica una pagina por defecto es 1
        

        // busca los productos en la bd
        const products = await productModel.find()/* .skip((page - 1) * PRODUCTS_PER_PAGE) .limit(PRODUCTS_PER_PAGE).lean();
         console.log(products) 
        // calcula los productos en la bd
        const totalProducts = await productModel.countDocuments();
        // calcular las paginas
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        const prevPage = page - 1
        const nextPage = page + 1;
        const prevLink = page > 1; // Verifica si hay un enlace "Anterior"
        const nextLink = page < totalPages;

        console.log("Nombre:", nombre);
        console.log("Apellido:", apellido);
        res.render("products", { 
            productos: products,
            page,
            totalPages, 
            nextPage, 
            prevPage, 
            prevLink, 
            nextLink,
            nombre,
            apellido 
        });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
        console.log(error)
    }
    
}); */

//allproducts actual
router.get("/allproducts", async (req, res) => {
    try {
        let nombre = "";
        let apellido = "";

        if (req.session.user) {
            // Si hay un usuario en la sesión autenticado por github
            if (req.session.user.nombre) {
                nombre = req.session.user.nombre; // Nombre del usuario autenticado
            }
            if (req.session.user.apellido) {
                apellido = req.session.user.apellido; // Apellido del usuario autenticado
            }
        } else {
            // si no se autentica con GitHub e ingresa con la cuenta de la base de datos, obtiene la información de la misma db
            nombre = req.session.nombreUsuario;
            apellido = req.session.apellidoUsuario;
        }

        const page = parseInt(req.query.page) || 1;

        // busca los productos en la bd
        const products = await productModel.find()/* .skip((page - 1) * PRODUCTS_PER_PAGE) */.limit(PRODUCTS_PER_PAGE).lean();
        
        // calcula los productos en la bd
        const totalProducts = await productModel.countDocuments();
        // calcular las paginas
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        const prevPage = page - 1
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
            apellido,
        });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
        console.log(error);
    }
});


/* router.get("/allproducts", async (req, res) => {
    try {
        
        let nombre = "";
        let apellido = "";
        console.log("nombre",nombre);
        if (req.isAuthenticated()) {
            // Si el usuario está autenticado, independientemente de cómo se haya autenticado
            nombre = req.user.nombre; // Nombre del usuario autenticado
            apellido = req.user.apellido; // Apellido del usuario autenticado
        }
        console.log("nombre",nombre);
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
            apellido,
        });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ message: "Error al obtener los productos" });
        console.log(error);
    }
}); */



router.get("/login", async (req, res)=>{
    try{
        res.render("login",{})
    } catch (error){
        console.log("error al acceder a la vista:", error);
    }
});

router.get("/profile", async (req, res) => {
    try {
      // Asegúrate de tener acceso a los datos necesarios, como el nombre y el email del usuario
      const nombre = req.session.nombreUsuario;
      const apellido = req.session.apellidoUsuario;
      const email = req.session.emailUsuario;
      const rol = req.session.rolUsuario;
  
      // Renderiza la vista profile y pasa los datos como un objeto
      res.render("profile", {
        nombre: nombre,
        apellido: apellido, 
        email: email,
        rol: rol
      });
    } catch (error) {
      console.log("Error al acceder a la vista de perfil:", error);
    }
  });



module.exports = router;

