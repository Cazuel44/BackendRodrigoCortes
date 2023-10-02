/* const {router} = require("express") */
const express = require("express")
const {userModel} = require("../models/users.model")

const router = express.Router()

//get 

router.get("/users", async(req, res)=>{
    try {
        let users = await userModel.find()
        res.send({result: "succes", payload: users})
    } catch (error) {
        console.log(error)
    }
});

//post

router.post("/api/users", async(req, res)=>{
    let {nombre, apellido, email} = req.body
    if(!nombre || !apellido || !email){
        res.send({status: "error", error: "Faltan datos"})
    }
    let usuario = await userModel.create({nombre, apellido, email})
    res.json({message: "Usuario creado"});
    console.log(usuario)
});

//put

router.put("/users/:uid", async(req, res)=>{
    let {uid} = req.params
    const userToReplace = req.body;

    try {
        const updateFields = {};
    
        if (userToReplace.nombre) {
          updateFields.nombre = userToReplace.nombre;
        }
    
        if (userToReplace.apellido) {
          updateFields.apellido = userToReplace.apellido;
        }
    
        if (userToReplace.email) {
          updateFields.email = userToReplace.email;
        }
    
        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({ status: "error", error: "Debes proporcionar al menos un campo para actualizar" });
        }
    
        const userUpdate = await userModel.updateOne({ _id: uid }, updateFields);
    
        if (userUpdate.nModified === 0) {
          return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
        }
    
        res.json({ status: "success", message: "Usuario actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Error al actualizar el usuario" });
    }
    
    
    /* if(!userToReplace.nombre || !userToReplace.apellido || !userToReplace.email){
        res.send({status: "error", error: "no hay datos en parametros"})
    }
    let userUpdate = await userModel.updateOne({_id: uid}, userToReplace)
    res.json({message: "Usuario actualizado"});
    console.log(userUpdate) */
});

//delete

router.delete("/users/:uid", async(req, res)=>{
    let {uid} = req.params
    await userModel.deleteOne({_id: uid});
    res.json({message: "Usuario eliminado"});
});

module.exports = router;