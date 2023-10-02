const express = require("express")
const path = require("path");
const fs = require("fs")
const {cartModel} = require("../models/carts.model")



const router = express.Router()
let carts = []
let products = []

async function lecturaJson() {
    const cartArchivo = path.join(__dirname, "../../carts.json");
    const productArchivo = path.join(__dirname, "../../products.json");
    
    try {
        carts = await fs.promises.readFile(cartArchivo, "utf-8")
        carts = JSON.parse(carts)
        products = await fs.promises.readFile(productArchivo, "utf-8")
        products = JSON.parse(products)
    } catch (error) {
        if(error.code === "ENOENT") {
            console.log("El archivo no existe")
        }
        console.log("error de lectura", error)
    }    
    /* console.log(carts) */
}
lecturaJson()


// traer carrito segun id
router.get("/carts/:cid", async (req, res) => {

    /* const cartId = parseInt(req.params.cid); */
    const cartId = req.params.cid;
    console.log(cartId)
    const carrito = await cartModel.findById(cartId);
    console.log(carrito)
    /* const carrito = carts.find((p)=> p.id === cartId) */
    if(!carrito){
        res.status(404).json({message: "Carrito no encontrado"});
    } else {
        /* const cart = carts[carrito]; */
        res.json(carrito);    
        console.log(carts);
    }
    
});

router.get("/api/carts", async (req, res) => {
    const carrito = await cartModel.find();
    if(!carrito){
        res.status(404).json({message: "Carrito no encontrado"});
    } else {
        res.json(carrito);    
    } 
});


// Ruta para crear un nuevo carrito
router.post("/api/carts", async (req, res)=>{
    const newCart = req.body;
    let {description, quantity, total} = req.body
    if(!description || !quantity || !total){
        res.send({status: "error", error: "Faltan datos"})
    }
    /* newCart.id = carts.length +1; */
    carts.push(newCart);
    /* fs.promises.writeFile("carts.json", JSON.stringify(carts)); */
    const cart = await cartModel.create(newCart)
    res.json({message: "Carrito creado"});
    console.log(cart);
});

// Ruta para agregar un producto al arreglo "products" del carrito seleccionado
router.post("/carts/:cid/product/:pid", (req, res)=>{ 
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const carrito = carts.findIndex((p)=> p.id === cartId);
    if(carrito === -1){
        res.status(404).json({message: "Carrito no encontrado"});
        return;
    }


    const producto = products.findIndex((p)=> p.id === productId)
    if(producto === -1){
        res.status(404).json({message: "Producto no encontrado"});
    }
    
    const indexProductInCart = carts[carrito].products.findIndex((product)=> product.product === productId)
    if(indexProductInCart === -1){
        carts[carrito].products.push({product: productId, quantity: 1});
        console.log(1)
    } else{
        console.log(carts[carrito].products[indexProductInCart])
        carts[carrito].products[indexProductInCart].quantity++;
        console.log(2)
    };
    
    fs.promises.writeFile("carts.json", JSON.stringify(carts));
    res.json({message: "Producto agregado"});

});

router.put("/api/carts/:id", async (req, res)=>{
    const id = req.params.id; 
    const newCart = req.body;
    let {description, quantity, total} = req.body
    if(!description || !quantity || !total){
        res.send({status: "error", error: "Faltan datos"})
    }
    const cart = await cartModel.findOneAndUpdate({_id: id}, newCart)
    res.json({message: "Carrito actualizado"});
    console.log(cart);
});

router.delete("/api/carts/:id", async (req, res)=>{
    const id = req.params.id; 
    await cartModel.findOneAndDelete({_id: id})
    res.json({message: "Carrito eliminado"});
});

module.exports = router;
