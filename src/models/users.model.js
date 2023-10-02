const mongoose = require("mongoose");

const usersCollection = "users";

const userSchema = new mongoose.Schema({
    nombre: {type: String, max: 20, required: true},
    apellido: {type: String, max: 30, required: true},
    email: {type: String, max: 50, required: true}
});

const userModel = mongoose.model(usersCollection, userSchema)

module.exports = {userModel}