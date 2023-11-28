const CartDao = require("../dao/mongo/carts.mongo");
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser');
const {PRIVATE_KEY} = require("../utils.js");
const {userDao} = require("./users.controllers.js")
const jwt = require("jsonwebtoken")

//se instancia la clase del carrito 
const cartDao = new CartDao();

// funcion para obtener un carrito especifico segun id 
async function getCartById(req, res) {
    try {
        const cartId = req.params.cid;
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ message: 'ID de carrito no válido' });
        }

        const cart = await cartDao.getCartById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        
        return res.render("cartDetail", { cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

/* async function getCartById(req, res) {
    try {
        const cartId = req.params.cid;
        console.log(cartId)
        const cart = await cartDao.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        return res.render("cartDetail", { cart }); // renderizar la vista con los datos del carrito
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
} */

//ruta para sacar el id del carrito del usuario para usar con el boton micarrito
async function getUserCart(req, res) {
    console.log("paso1funcion")
    try {
        console.log("FUNCA")
        // Obtener el token del encabezado de la solicitud
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token de autorización no válido' });
        }

        const token = authHeader.split(' ')[1]; // Obtener solo el token, eliminando 'Bearer '

        // Verificar y decodificar el token para obtener la información del usuario
        const decodedToken = jwt.verify(token, PRIVATE_KEY); 

        // Obtener el correo electrónico del usuario desde el token decodificado
        const userEmail = decodedToken.email;
        console.log(userEmail);

        // Resto del código para obtener el carrito...
        // Buscar al usuario en la base de datos usando el correo electrónico
        const user = await userDao.getUserByEmail(userEmail);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener el ID del carrito del usuario encontrado
        const cartId = user.carrito;
        console.log("Valor de user.carrito:", user.carrito);
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ message: 'ID de carrito no válido' });
        }

        // Buscar el carrito utilizando el ID obtenido
        const cart = await cartDao.getCartById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        console.error('Error al obtener el carrito del usuario:', error);
        return res.status(500).json({ message: 'Error al obtener el carrito del usuario.' });
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
        return res.status(500).json({ error: "Algo salió mal al eliminar el producto del carrito" });
    }
}

//completar compra del carrito
async function purchaseProducts(req, res) {
    const cartId = req.params.cid;

    try {
        // Lógica para obtener los productos del carrito...
        const cartProducts = await getCartProducts(cartId); // Función para obtener los productos del carrito

        // Verificar el stock de cada producto en el carrito en la base de datos
        const insufficientStock = await checkInsufficientStock(cartProducts);

        if (insufficientStock) {
            return res.status(400).json({ message: 'Uno o más productos están fuera de stock.' });
        }

        // Calcular el total de todos los productos
        const totalAmount = calculateTotal(cartProducts);

        // Crear un ticket único con el total y otras características
        const ticketData = {
            code: generateUniqueCode(),
            purchaser: userId,
            total: totalAmount,
            products: cartProducts, // Aquí irían los productos del carrito
            // Otras propiedades como la fecha y demás
        };

        // Reducir el stock de cada producto comprado en la base de datos
        await reduceProductStock(cartProducts);

        // Guardar el ticket en la base de datos usando el DAO
        const createdTicket = await cartDao.createTicket(ticketData);

        return res.status(200).json({ ticket: createdTicket });
    } catch (error) {
        console.error('Error al comprar productos del carrito:', error);
        return res.status(500).json({ message: 'Error al comprar productos del carrito.' });
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
    purchaseProducts,
    getUserCart,
};