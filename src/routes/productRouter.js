const express = require("express")
const { isUtf8 } = require("buffer");
const fs = require("fs")
const path = require("path");
const { error } = require("console");
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


// traer todos los productos (incluir limit queriparams)
router.get("/products", (req, res)=>{
    res.json(products);
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
router.post("/api/products", (req, res)=>{
    const newProduct = req.body
    newProduct.id = products.length +1;
    console.log(products)
    products.push(newProduct)
    fs.promises.writeFile("products.json", JSON.stringify(products))
    res.json({message: "Producto agregado"});
});

// Ruta para actualizar un producto por ID
router.put("/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const producto = products.findIndex((p)=> p.id === productId);
    if(/* ! */producto === -1){
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
    }  
});


router.delete("/products/:id", (req, res)=>{
    const productId = parseInt(req.params.id);
    const producto = products.findIndex((p)=> p.id === productId);
    if(producto === -1){
        res.status(404).json({ message: "Producto no encontrado" });
    } else {
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
                    res.status(500).json({message: "error al escribir el archivo"})
                    return;
                }
                res.json({message: "Producto eliminado con exito", deletedProducts})
            });
        });
    }
});

module.exports = router
module.exports = products;