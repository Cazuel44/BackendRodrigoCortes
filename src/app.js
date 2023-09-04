const express = require("express")
const app = express()
const PORT = 8080

app.use(express.urlencoded({extended:true}))

const productos =[
    {id:"1", nombre: "Poleron", descripcion: "Puma negro L", precio: 1500, stock: 8},
    {id:"2", nombre: "Polera", descripcion: "Nike blanco XL", precio: 2500, stock: 5},
    {id:"3", nombre: "Pantalon", descripcion: "Levis azul M", precio: 3000, stock: 15},
    {id:"4", nombre: "Buzo", descripcion: "Nike negro L", precio: 2800, stock: 9},
    {id:"5", nombre: "Short", descripcion: "Adidas plomo L", precio: 2300, stock: 12},
    {id:"6", nombre: "camisa", descripcion: "LAcoste manga larga XM ", precio: 2000, stock: 7},
    {id:"7", nombre: "Falda", descripcion: "Adidas azul XS", precio: 3600, stock: 8},
    {id:"8", nombre: "Poleron", descripcion: "Niker plomo L", precio: 20, stock: 5},
    {id:"9", nombre: "Polera manga larga", descripcion: "Adidas blanco XL", precio: 4000, stock: 4}
]

app.get("/products", (request, response)=>{
    response.send(productos)
})

app.get("/products/:idProduct", (request, response)=>{
    let idProduct = request.params.idProduct

    let producto = productos.find(producto=> producto.id === idProduct)

    if(!producto) return response.send({error: "Error de producto"})
    response.send({producto})
})

app.listen(PORT, ()=>{
    console.log(`server escuchando en ${PORT}`)

})
