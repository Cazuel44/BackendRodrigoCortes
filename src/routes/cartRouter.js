const express = require("express")
const path = require("path");
const fs = require("fs")
const {cartModel} = require("../models/carts.model")
const {productModel} = require("../models/products.model")



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
    let {user, products/* , total */} = req.body
    if(!user || !products /* || !total */){
        res.send({status: "error", error: "Faltan datos"})
    }

    try {
        const productObjects = await productModel.find({ _id: { $in: products } });
        
        // Verificar si se encontraron los productos segun el id creado por mongo
        if (productObjects.length !== products.length) {
            return res.status(400).json({ status: "error", error: "Algunos productos no existen" });
        }

        const total = productObjects.reduce((accumulator, product) => accumulator + product.price, 0);
        console.log("Total:", total);

        newCart.total = total;
        const cart = await cartModel.create(newCart);
        res.json({ message: "Carrito creado" });
        console.log(cart);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear el carrito" });
    }
    
});

// ruta para agregar un producto al arreglo "products" del carrito seleccionado 
router.post("/api/carts/:cid/products", async (req, res)=>{ 

    try {
        const cartId = req.params.cid;
        const productIds = req.body.productIds; 

        // busca el carrito en la bd
        const carrito = await cartModel.findById(cartId);
        if (!carrito) {
            res.status(404).json({ message: "Carrito no encontrado" });
            return;
        }

        // busca el producto en la bd
        const products = await productModel.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(404).json({ message: "Uno o varios de los productos no se encontró" });
        }


        // agregar productos con spread opereitor
        carrito.products.push(...productIds);

        // Guarda el carrito actualizado en la base de datos
        await carrito.save();

        return res.json({ message: "Producto agregado al carrito" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al agregar el producto al carrito" });
    }

});

// ruta para actualizar quantity de un producto del carrito
router.put("/api/carts/:cid/products/:pid", async (req, res)=>{
    
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity; // Asumiendo que la nueva cantidad se proporciona en req.body

        // Encuentra el carrito por su ID
        const carrito = await cartModel.findById(cartId);

        if (!carrito) {
            res.status(404).json({ message: "Carrito no encontrado" });
            return;
        }

        // busca carrito por id
        const productInCart = carrito.products.findIndex(product => product.toString() === productId);

        if (productInCart) {

            // modifica cantidad de un producto
            productInCart.quantity = newQuantity;

            // calcular total
            const newTotal = carrito.products.reduce((total, product) => {
                return total + (product.price * product.quantity);
            }, 0);

            // actualizar total de un carrito
            carrito.total = newTotal;
        }

        // guarda los cambios en base de datos
        await carrito.save();

        res.json({ message: "Cantidad de producto en el carrito actualizada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar la cantidad en el carrito" });
    }
    
}); 


//ruta para eliminar carrito
router.delete("/api/deletecarts/:id", async (req, res)=>{
    const id = req.params.id; 
    await cartModel.findOneAndDelete({_id: id})
    res.json({message: "Carrito eliminado"});
});

//ruta para eliminar todos los productos del carrito
router.delete("/api/deleteproductcarts/:cid", async (req, res)=>{
    const id = req.params.cid; 
    try {
        // carrito por id
        const cart = await cartModel.findById(id);

        if (!cart) {
            res.status(404).json({ message: "Carrito no encontrado" });
            return;
        }

        // eliminar los productos del carrito
        cart.products = [];

        // guardar el carrito en la base de datos
        await cart.save();

        res.json({ message: "Productos eliminados del carrito " });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar los productos del carrito" });
    }
});

//ruta para eliminar producto de un carrito especifico
router.delete("/api/carts/:cid/product/:pid", async (req, res)=>{

    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const carrito = await cartModel.findById(cartId);
        if (!carrito) {
            res.status(404).json({ message: "Carrito no encontrado" });
            return;
        }
        console.log(carrito)
        
        const productIndex = carrito.products.findIndex(product => product.toString() === productId);
        if (productIndex === -1) {
            res.status(404).json({ message: "Producto no encontrado en el carrito" });
            return;
        }
       
        console.log(productIndex)

        const productToDelete = carrito.products[productIndex];
        const productPrice = productToDelete.price;
        if (!isNaN(productPrice)) {
            carrito.total = (carrito.total || 0) - productPrice;
        }
        carrito.products.splice(productIndex, 1);

        await carrito.save();
        res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el producto del carrito" });
    }
    
});

module.exports = router;
