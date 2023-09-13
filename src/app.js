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
app.use("/", productsRouter)


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