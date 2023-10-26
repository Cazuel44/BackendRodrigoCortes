const mongoose = require("mongoose");

const usersCollection = "users";


const userSchema = new mongoose.Schema({
    nombre: { type: String, max: 20, required: false },
    apellido: { type: String, max: 30, required: false },
    email: { type: String, max: 50, required: true },
    password: { type: String, max: 50, required: false }, 
    isGithubAuth: { type: Boolean, default: false, required: false },
    rol: { type: String, enum: ["user", "admin"], default: "user" }
});




/* const userSchema = new mongoose.Schema({
    nombre: {type: String, max: 20, required: true},
    apellido: {type: String, max: 30, required: true},
    email: {type: String, max: 50, required: true},
    password: {type: String, max: 50, required: true}, //implementando password a los usuarios corregir las rutas 
    isGithubAuth: { type: Boolean, default: false },
    rol: { type: String, enum: ["user", "admin"],  required: true, default: "user" } // comentar required
}); */

// Validación condicional para campos requeridos
userSchema.pre("save", function(next) {
    // Verificar si el usuario se autenticó con GitHub
    if (this.isGithubAuth) {
        // Si se autenticó con GitHub, invalidar los campos requeridos
        this.apellido = undefined;
        this.password = undefined;
    }
    next();
});

const userModel = mongoose.model(usersCollection, userSchema)

module.exports = {userModel}