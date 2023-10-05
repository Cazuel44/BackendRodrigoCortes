const express = require("express")
const {userModel} = require("../models/users.model")
const {messageModel} = require("../models/messages.model")

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

router.post("/saveuserymsge", async (req, res) => {
  const { user, lastName, email, message } = req.body;
  if (!user || !lastName || !email || !message) {
    return res.status(400).json({ status: "error", error: "Faltan datos en los parámetros" });
  }
  console.log(message) // trae correctamente el mensaje 
  console.log(req.body)// trae correctamente el req.body
  try {
  // Buscar email repetido
  const existUser = await userModel.findOne({ email });
  // condicional en caso que si existe correo
  if (existUser) {
    const newMessage = new messageModel({ user: existUser._id, message: message });
    await newMessage.save();
    res.json({ status: "success", message: "Mensaje guardado con éxito para el usuario existente" });
  } else {
    // Crear un nuevo usuario
    const newUser = new userModel({ nombre, apellido, email });
    await newUser.save();
    // Crear un nuevo mensaje asociado al usuario
    const newMessage = new messageModel({ user: newUser._id, message: message, });
    await newMessage.save();
    res.json({ status: "success", message: "Usuario y mensaje guardados con éxito" });
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al guardar el usuario y el mensaje" });
  }
});

//put modificar un usuario 

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
    

});

//delete

router.delete("/users/:uid", async(req, res)=>{
    let {uid} = req.params
    await userModel.deleteOne({_id: uid});
    res.json({message: "Usuario eliminado"});
});

module.exports = router;