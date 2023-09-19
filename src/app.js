const express = require("express")
const path = require("path")
const cartRouter = require("./routes/cartRouter")
const productsRouter = require("./routes/productRouter")
const vistaRouter = require("./routes/vistaRouter")
const { isUtf8 } = require("buffer");
const fs = require("fs")
const socketIo = require("socket.io")
const {Server} = require("socket.io")
const http = require("http")
const handlebars = require('express-handlebars');
const { error } = require("console");


const app = express()
const server = http.createServer(app)
const io = new Server(server)
global.io = io;
const PORT = 8080

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
app.use(express.json());
app.use(express.urlencoded({extended: true}));


/* //CONFIGURACION CARPETA PUBLICA
app.use(express.static(path.join(__dirname, "public"))) */



//RUTAS
app.use("/", cartRouter);
app.use("/", productsRouter); // agregue al codigo .router (no arroja error al guardar pero si al ejecutar el post)
app.use("/", vistaRouter);



//Configuración de handlebars
app.engine("handlebars", handlebars.engine());

//Usa handlebars como motor de plantillas
app.set("view engine", "handlebars");

//Usa la carpeta views como carpeta de vistas
app.set("views", __dirname + "/views");

//Archivos dentro de la carpeta public
app.use(express.static(path.join(__dirname, "public")));


io.on('connection', (socket) => {
    console.log('Cliente conectado');
  
    socket.emit('conexion-establecida', 'Conexión exitosa con el servidor de Socket.IO');
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
});



server.listen(PORT, ()=>{
    console.log(`servidor corriendo en puerto ${PORT}`)
})



