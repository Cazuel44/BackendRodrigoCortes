const CartDao = require("../dao/clases/carts.dao.js");

//se instancia la clase del carrito 
const cartDao = new CartDao();

// funcion para obtener un carrito especifico segun id 
async function getCartById(req, res) {
    try {
        const cartId = req.params.cid;
        const cart = await cartDao.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        return res.render("cartDetail", { cart }); // renderizar la vista con los datos del carrito
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

// funcion para obtener todos los carritos
async function getAllCarts(req, res) {
    // try catch pa manejo de errores
    try {
        // se guarda en la constante de nombre carts todos los carritos de la base de datos con la funcion getallcarts
        const carts = await cartDao.getAllCarts(); 
        // se aplica una condicional donde: si !NO se encuentran los carritos retorna un error y se corta la condicion con el mismo return 
        if (!carts) {
            return res.status(404).json({ message: "No se encontraron carritos" });
        }
        // de lo contrario muestra todos los carritos
        return res.json(carts);
    } catch (error) {
        //si nada funciona se muestra el error maximo
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

//funcion para crear un carrito
async function createCart(req, res) {
    try {
        const newCart = req.body;
        const cart = await cartDao.createCart(newCart);
        if (!cart) {
            return res.status(500).json({ message: "Error al crear el carrito" });
        }
        return res.json({ message: "Carrito creado", cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

// funcion para añadir un producto especifico a un carrito especifico 
async function addProductToCart(req, res) {
    try {
        // en la logica se obtiene el id del carrito + id del producto especifico y se agrega el producto al carrito si todo funciona bien 
        const cartId = req.params.cid;
        const productIds = req.body.productIds;
        const result = await cartDao.addProductToCart(cartId, productIds);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

// contador (cantidad) de un producto en un carrito
async function updateProductQuantity(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        const result = await cartDao.updateProductQuantity(cartId, productId, newQuantity);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

// borrar un carrito especifico
async function deleteCartById(req, res) {
    try {
        const cartId = req.params.id;
        const result = await cartDao.deleteCartById(cartId);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Algo salió mal al eliminar el carrito" });
    }
}

// limpiar un carrito especifico segun id (del carrito)
async function deleteAllProductsInCart(req, res) {
    try {
        const cartId = req.params.cid;
        const result = await cartDao.deleteAllProductsInCart(cartId);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Algo salió mal al eliminar los productos del carrito" });
    }
}

// eliminar un producto especifico de un carrito especifico (id de carrito / id de producto)
async function deleteProductFromCart(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const result = await cartDao.deleteProductFromCart(cartId, productId);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Algo salió mal al eliminar el producto del carrito' });
    }
}

module.exports = {
    getCartById,
    getAllCarts,
    createCart,
    addProductToCart,
    updateProductQuantity,
    deleteCartById,
    deleteAllProductsInCart,
    deleteProductFromCart,
};