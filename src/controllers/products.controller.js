const ProductDao = require("../dao/mongo/products.mongo"); // Importa tu DAO o servicio adecuado


// se instancia la clase de productos
const productDao = new ProductDao(); 

// funcion para obtener todos los productos
const getProducts = async (req, res) => {
    try {
        // obtiene parametros de consulta (query parameters)
        // Aquí se extraen tres parámetros: page, limit, y sortBy.
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || "price";
        
        //parseInt se utiliza para convertir los valores de los parametros de consulta a números enteros. Si no se proporciona un parametro específico, se establece un valor predeterminado (page=1, limit=20 y sortBy="price").
        const options = { page: page, limit: limit, sort: { [sortBy]: 1 } };
        
        //productos paginados desde el DAO (Data Access Object) el DAO realiza una consulta a la base de datos para obtener los productos según las opciones proporcionadas.
        const result = await productDao.getPaginatedProducts(options);

        // condicional si !NO encuentra los productos retorna un error 
        if (!result.products.length) {
            return res.status(404).json({ message: "Productos no encontrados" });
        }

        // si todo sale bien muestra los productos
        res.json({
            products: result.products,
            currentPage: result.currentPage,
            totalPages: result.totalPages,
        });

        //si todo sale mal muestra el error maximo
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

// obtener un producto especifico segun id 
const getProductById = async (req, res) => {
    const productId = req.params.pid;
    try {
        const result = await productDao.getProductById(productId);
        if (!result) {
            res.status(404).json({ message: "Producto no encontrado" });
        } else {
            const formattedProduct = {
                title: result.title,
                description: result.description,
                code: result.code,
                price: result.price,
                stock: result.stock,
                category: result.category,
                quantity: result.quantity
                // agregar mas propiedades si se necesita
            };
            res.render("productDetail", { product: formattedProduct });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Algo salio mal intenta mas tarde" });
    }
};

// funcion para crear un nuevo producto 
const saveProduct = async (req, res) => {
    const newProduct = req.body;
    try {
        const result = await productDao.saveProduct(newProduct);
        res.json({ status: "success producto creado", result: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", error: "Algo salio mal intenta mas tarde" });
    }
};

// actualizar un producto especifico segun id
const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    
    // intenta acceder a un producto especifico de la base de datos y mediante postman se modifica lo que se requiere y lo que no se mantiene tal cual esta 
    try {
        const result = await productDao.updateProduct(productId, updatedProduct);
        res.json({ status: "success producto actualizado", result: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", error: "Algo salio mal intenta mas tarde" });
    }
};

// eliminar un producto especifico segun id
const deleteProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const result = await productDao.deleteProduct(productId);
        res.json({ status: "success producto eliminado", result: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", error: "Algo salio mal intenta mas tarde" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    saveProduct,
    deleteProduct,
    updateProduct,
};