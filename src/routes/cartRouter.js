const express = require("express")
const path = require("path");
const fs = require("fs")
const products = require("./products.js");
const router = express.Router()




let carts = []

async function lecturaJson() {
    const productsArchivo = path.join(__dirname, "../../carts.json");
    
    try {
        carts = await fs.promises.readFile(productsArchivo, "utf-8")
        carts = JSON.parse(carts)
    } catch (error) {
        if(error.code === "ENOENT") {
            console.log("El archivo no existe", productsArchivo)
        }
        console.log("error de lectura", error)
    }    
    /* console.log(carts) */
}
lecturaJson()






// traer todos los carritos (incluir limit queriparams)
router.get("/carts", (req, res)=>{
    res.json(carts)
})


// traer carrito segun id
router.get("/carts/:cid", (req, res) => {
    const cartId = parseInt(req.params.cid);
    const carrito = carts.find((p)=> p.id === cartId)
    if(!carrito){
        res.status(404).json({message: "Carrito no encontrado"});
    } else {
        /* const cart = carts[carrito]; */
        res.json(carrito);    
        console.log(carts);
    }
    
});


// Ruta para crear un nuevo carrito
router.post("/api/carts", (req, res)=>{
    const newCart = req.body;
    newCart.id = carts.length +1;
    carts.push(newCart);
    fs.promises.writeFile("carts.json", JSON.stringify(carts));
    res.json({message: "Producto agregado"});
    console.log(carts);
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

    const producto = products.findIndex((p)=> p.id === producto)
    if(producto === -1){
        res.status(404).json({message: "Producto no encontrado"});
    }
    const cart = carts[cartId];
    cart.products.push(productId);
});

module.exports = router