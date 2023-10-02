const express = require("express")
const { isUtf8 } = require("buffer");
const fs = require("fs")
const path = require("path");
const { error } = require("console");
const {productModel} = require("../models/products.model")




const router = express.Router();
let products = []


async function lecturaJson() {
    const productsArchivo = path.join(__dirname, "../../products.json");
    
    try {
        products = await fs.promises.readFile(productsArchivo, "utf-8")
        products = JSON.parse(products)
    } catch (error) {
        if(error.code === "ENOENT") {
            console.log("El archivo no existe", productsArchivo)
        }
        console.log("error de lectura", error)
    }    
    /* console.log(products) */
}
lecturaJson()


// traer todos los productos 
router.get("/products", async (req, res)=>{
    const productos = await productModel.find();
    if(!productos){
        res.status(404).json({message: "productos no encontrados"});
    } else {
        res.json(productos);    
    } 
});


// traer producto segun id
router.get("/products/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const producto = products.find((p)=> p.id === productId)
    if(!producto){      //consultar por condicional /* ! */producto === -1
        res.status(404).json({message: "Producto no encontrado"})
    } else {
        res.json(producto);    
        console.log(producto)
    }
    
});


// Ruta para crear un nuevo producto
router.post("/api/products", async (req, res)=>{
    const newProduct = req.body
    let {title, description, code, price, stock, category, thumbnails} = req.body
    if(!title || !description || !code || !price || !stock || !category || !thumbnails){
        res.send({status: "error", error: "Faltan datos"})
    }
    /* newProduct.id = products.length +1; */
    products.push(newProduct)
    /* global.io.emit('newProduct', newProduct); */
    
    /* fs.promises.writeFile("products.json", JSON.stringify(products)) */
    const product = await productModel.create(newProduct)
    res.json({message: "Producto agregado"});
    console.log(product)
});


// Ruta para actualizar un producto por ID
router.put("/products/:id", async (req, res) => {

    const productId = req.params.id;
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(productId, req.body, { new: true });
    
        if (!updatedProduct) {
          return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({message: "producto actualizado"});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el producto" });
    }

    /* const producto = products.findIndex((p)=> p.id === productId);
    if(producto === -1){
        res.status(404).json({message: "producto no encontrado"})
    } else {
        
        const { title, description, code, price, status, stock, category } = req.body;
        const updatedProduct = {...products[producto], title: title || products[producto].title, description: description || products[producto].description, code: code || products[producto].code, price: price || products[producto].price, status: status || products[producto].status, stock: stock || products[producto].stock, category: category || products[producto].category,};
        
        products[producto] = updatedProduct;

        const productsArchivo = path.join(__dirname, "../../products.json");
        fs.readFile(productsArchivo, "utf-8", (error, data) =>{
            if (error) {
                res.status(500).json({ message: "Error al leer el archivo" });
                return;
            }

            const productsData = JSON.parse(data);

            productsData[producto] = updatedProduct;

            fs.writeFile(productsArchivo, JSON.stringify(productsData, null, 2), (error) =>{
                if(error){
                    res.status(500).json({message: "error al actualizar el producto"})
                    return;
                }
                res.json(`Producto con ID ${productId} actualizado`);
            });
        });       
    } */  
});


router.delete("/products/:id", async (req, res)=>{
    const productId = req.params.id;
    
    await productModel.findOneAndDelete({_id: productId})
    res.json({message: "producto eliminado"});
    
    
    /* const producto = products.findIndex((p)=> p.id === productId);
    if(producto === -1){
        res.status(404).json({ message: "Producto no encontrado" });
    } else {
        global.io.emit('deleteProduct', productId);
        const deletedProducts = products.splice(producto, 1)[0];
        const productsArchivo = path.join(__dirname, "../../products.json");

        fs.readFile(productsArchivo, "utf-8", (error, data) =>{
            if (error) {
                res.status(500).json({ message: "Error al leer el archivo" });
                return;
            }

            const productsData = JSON.parse(data);
            productsData.splice(producto, 1);
            
            fs.writeFile(productsArchivo, JSON.stringify(productsData, null, 2), (error) =>{
                if(error){
                    res.status(500).json({message: "error al escribir el archivo"});
                    return;
                }
                res.json({message: "Producto eliminado con exito", deletedProducts})
            });
        });
    } */
});

module.exports = router;
