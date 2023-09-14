const express = require("express")
const path = require("path")
const cartRouter = require("./routes/cartRouter")
const productsRouter = require("./routes/productRouter")
const { isUtf8 } = require("buffer");
const fs = require("fs")
const PORT = 8080
const app = express()



async function crearArchivoJson() {
    try {
        const products = fs.existsSync("products.json")  // consultar porque la sintaxis no lleva .promises ej: fs.promises.existync...
        if(!products){
            fs.writeFileSync("products.json", JSON.stringify([]))
            console.log("archivo products.json creado exitosamente")
        } else {
            console.log("El archivo products.json ya existe")
        }
        const carts = fs.existsSync("carts.json")
        if(!carts){
            fs.writeFileSync("carts.json", JSON.stringify([]))
            console.log("archivo carts.json creado exitosamente")
        } else {
            console.log("El archivo carts.json ya existe")
        }
        
    } catch (error) {
        console.log(" Error al crear el archivo", error)
    }
}

crearArchivoJson()





//MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({extended: true}))


//CONFIGURACION CARPETA PUBLICA
app.use(express.static(path.join(__dirname, "public")))



//RUTAS
app.use("/", cartRouter)
app.use("/", productsRouter) // agruegue al codigo .router (no arroja error al guardar pero si al ejecutar el post)



//RUTA PARA SERVIR EL ARCHIVO HTML
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public", "index.html"))
})



app.listen(PORT, ()=>{
    console.log(`servidor corriendo en puerto ${PORT}`)
})




// plantilla peticion post 
/* {
    "title": "polera puma",
    "description": "color negro, talla XL",
    "code": "155",
    "price": 15000,
    "status": true,
    "stock": 5,
    "category": "poleras",
    "thumbnails": "rutaimg"
} */

// productos creados con postman en caso de que se pierda info
//{"title":"polera puma","description":"color negro, talla XL","code":"155","price":15000,"status":true,"stock":5,"category":"poleras","thumbnails":"rutaimg","id":1},{"title":"polera adidas","description":"color verde, talla XL","code":"158","price":17000,"status":true,"stock":9,"category":"poleras","thumbnails":"rutaimg","id":2},{"title":"polera volcom","description":"color blanco, talla L","code":"114","price":16000,"status":true,"stock":19,"category":"poleras","thumbnails":"rutaimg","id":3},{"title":"pantalon americanino","description":"color negro, talla XL","code":"120","price":20000,"status":true,"stock":8,"category":"pantalones","thumbnails":"rutaimg","id":4},{"title":"buzo nike","description":"color plomo, talla L","code":"180","price":17000,"status":true,"stock":10,"category":"pantalones","thumbnails":"rutaimg","id":5},{"title":"buzo puma","description":"color negro, talla S","code":"183","price":18000,"status":true,"stock":10,"category":"pantalones","thumbnails":"rutaimg","id":6}