

class ProductManager {
    constructor(){
        this.productos = [];
        
    }

    static id = 0

    getProducts(){
        return this.productos
    }

    getProductsById(id){
        const idFilter = this.productos.find(producto => producto.id === id)
        if(idFilter){
            console.log("Producto encontrado", idFilter)
        } else {
            console.log("NOT FOUND")
            return;
        }
    }
    
    addProduct(title, description, price, thumbnail, code, stock) {

        if(!title || !description || !price || !thumbnail || !code || !stock){
            console.log("Todos los campos son obligatorios para agregar un producto")
            return;
        }

        const existingProductFilter = this.productos.find(productos => productos.code === code);
        if(existingProductFilter) {
            console.log("Ya existe un producto con el mismo codigo")
            return;
        }

        ProductManager.id++;
        const newProduct = {
            id: ProductManager.id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        }
        this.productos.push(newProduct)
        
        /* console.log(newProduct) */

    }
}

const productManager = new ProductManager();

productManager.addProduct("polera", "talla L", 1500, "./poleraimg.jpg", "codigo1", 8)
productManager.addProduct("pantalon", "talla XL", 1000, "./pantalonimg.jpg", "codigo2", 10)
productManager.addProduct("zapatilla", "talla 41", 10000, "./zapatillaimg.jpg", "codigo3", )
productManager.addProduct("poleron", "talla XL", 8500, "./poleronimg.jpg", "codigo1", 15)

const productos = productManager.getProducts();
console.log("Lista de productos:", productos);

productManager.getProductsById(1);
productManager.getProductsById(3);
