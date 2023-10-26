const express = require("express")
const { isUtf8 } = require("buffer");
const fs = require("fs")
const path = require("path");
const { error } = require("console");
const {productModel} = require("../models/products.model.js")





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


// traer todos los productos o traer un limite de productos utilizando ?limit=Xcantidad FALTA QUERI EN EL GET
router.get("/products", async (req, res)=>{
    
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || "price";
        /* const productos = await productModel.find().limit(limit); */
        
        const options = {page: page,limit: limit, sort: {[sortBy]: 1}};

        const paginateProducts = await productModel.paginate({}, options);
        if (!paginateProducts) {
            res.status(404).json({ message: "Productos no encontrados" });
        } else {
            res.json({
                products: paginateProducts.docs,
                currentPage: page,
                totalPages: paginateProducts.totalPages,
            });
        }
        /* if(!productos){
        res.status(404).json({message: "productos no encontrados"});
        } else {
        res.json(productos);    
        }  */
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener productos" }, payload);
    }
    
    
});


// traer producto segun id
router.get("/product/:pid", async (req, res) => {
    const productId = req.params.pid;
    try {
        const producto = await productModel.findOne({ _id: productId }).lean();

        if (!producto) {
            res.status(404).json({ message: "Producto no encontrado" });
        } else {
            res.render("productDetail", { product: producto });
            console.log(producto);
        }
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ message: "Error al obtener el producto" });
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

   
});

// ruta para eliminar un producto por id
router.delete("/products/:id", async (req, res)=>{
    const productId = req.params.id;
    
    await productModel.findOneAndDelete({_id: productId})
    res.json({message: "producto eliminado"});
    
    
});

module.exports = router;
