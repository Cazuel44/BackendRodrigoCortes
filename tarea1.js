const { error } = require('console');
const fs = require('fs');


class ProductManager {
    constructor(){
        this.productos = [];
        this.getProducts();
        this.idCounter = 0
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

        this.idCounter++;
        const newProduct = {
            id: this.idCounter,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        }
        this.productos.push(newProduct)
        
    }

    guardarProductosEnArchivoNuevo() {
        const productosAString = JSON.stringify(this.productos, null, 2);
        try{
            fs.writeFile("productos.txt", productosAString, "utf-8", (error) =>{
                if(error){
                    console.log("error al crear archivo", error)
                } else {
                    console.log("archivo creado con exito")
                }
            })
        } catch (error){
            console.log("explota todo", error)
        }
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
    
    getProducts(){
        try {
            const datos = fs.readFileSync("productos.txt", "utf-8");
            const productosParseados = JSON.parse(datos);
            this.productos = productosParseados;
            console.log("Productos cargados archivo productos.txt");
        } catch (error) {
            console.log("Error al cargar productos", error);
        }
    }

    updateProductById = async(id, updateProduct)=>{
        try {
            const datos = await fs.promises.readFile("productos.txt", "utf-8");
            const productosParseados = JSON.parse(datos);
            const indiceProducto = productosParseados.findIndex(producto => producto.id === id);

            if(indiceProducto != -1){
                productosParseados[indiceProducto] = {...productosParseados[indiceProducto], ...updateProduct};
                await fs.promises.writeFile("productos.txt", JSON.stringify(productosParseados), "utf-8")
                console.log(`producto con id ${id} actualizado`)
            } else {
                console.log("producto no encontrado")
            }
        } catch (error) {
            console.log("error maximo")
        }
    }
    
    deleteProductById = async(id)=>{

        try {
            const datos = await fs.promises.readFile("productos.txt", "utf-8");
            const productosParseados = JSON.parse(datos);
            const productFilter = productosParseados.filter(products => products.id != id)           
            await fs.promises.writeFile("productos.txt", JSON.stringify(productFilter), "utf-8");
            console.log("producto eliminado")
        } catch(error) {
            console.log("error al leer el archivo", error)
        }
    }
}

const productManager = new ProductManager();

productManager.addProduct("polera", "talla L", 1500, "./poleraimg.jpg", "codigo1", 8)
productManager.addProduct("pantalon", "talla XL", 1000, "./pantalonimg.jpg", "codigo2", 10)
productManager.addProduct("zapatilla", "talla 41", 10000, "./zapatillaimg.jpg", "codigo3", )
productManager.addProduct("poleron", "talla XL", 8500, "./poleronimg.jpg", "codigo1", 15)
productManager.addProduct("poleron", "talla L", 10000, "./poleron2img.jpg", "codigo4", 7)

productManager.guardarProductosEnArchivoNuevo()
console.log("Lista de productos:", productManager.productos);
productManager.getProductsById(1);
productManager.getProductsById(3);
productManager.getProductsById(4);

//productManager.deleteProductById(3);

//productManager.updateProductById(1, {price: 3500, description: "talla XL", stock: 5})

