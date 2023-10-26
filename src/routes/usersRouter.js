const express = require("express")
const {userModel} = require("../models/users.model.js")
const {messageModel} = require("../models/messages.model.js");
const { createHash, isValidPassword, generateToken } = require("../utils.js");

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
// ruta para crear usuario mediante postman
router.post("/api/users", async(req, res)=>{
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ status: "error", error: "Faltan datos" });
  }

  try {
    const usuario = await userModel.create({ nombre, apellido, email, password });
    res.json({ message: "Usuario creado", user: usuario });
    console.log(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al crear el usuario" });
  }
});

//esta ruta guarda y crea el usuario del formulario y el mensaje (RECORDAR CAMBIO DE RUTA DE /saveusrymsge a register en caso de erro)
router.post("/Register", async (req, res) => {
  const { nombre, apellido, email, password, message, rol } = req.body;
  if (!nombre || !apellido || !email || !password /* || !message */) {
    return res.status(400).json({ status: "error", error: "Faltan datos en los parámetros" });
  }
  console.log(message) // trae correctamente el mensaje 
  console.log(req.body)// trae correctamente el req.body
  try {
    // Buscar email repetido
    const existUser = await userModel.findOne({ email });
    // condicional en caso que si existe correo
    if (existUser) {
      return res.status(400).json({ status: "error", error: "El usuario ya existe" });
    }

    // Si el usuario no existe, crea un nuevo usuario con nombre, apellido, email y contraseña
    const newUser = new userModel({ nombre, apellido, email, password: createHash(password), rol: rol || "user" });
    await newUser.save();

    // Crea un nuevo mensaje asociado al usuario si esque el mensaje existe
    if (message){
      const newMessage = new messageModel({ user: newUser._id, message });
      await newMessage.save();
    }
    
    const accessToken = generateToken({ user: newUser });// EN ESTA LINEA SE GENERA EL TOKEN PARA EL NUEVO USUARIO
    return res.json({ status: "success", message: "Usuario registrado con éxito", access_token: accessToken }); //se agrega generate_token
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", error: "Error al guardar el usuario y el mensaje" });
  }
});


//ruta para ingresar con un usuario
router.post("/Login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Buscar un usuario en la base de datos por su email
    const user = await userModel.findOne({ email });

    if (user) {
      // Comprobar si la contraseña coincide utilizando la función isValidPassword
      if (isValidPassword(user, password)) {
        // Generar un token de autenticación
        const token = generateToken(user);
        console.log("Token generado:", token);
        // Establecer las variables de sesión
        req.session.emailUsuario = email;
        req.session.nombreUsuario = user.nombre;
        req.session.apellidoUsuario = user.apellido;
        req.session.rolUsuario = user.rol;

        if (user.rol === "admin") {
          res.redirect("/profile");
        } else {
          res.redirect("/allproducts");
        }
      } else {
        // Contraseña incorrecta
        res.redirect("../../login");
      }
    } else {
      // No se encontró un usuario con ese email
      res.redirect("../../login");
    }
  } catch (error) {
    res.status(500).send("Error al ingresar: " + error.message);
  }
});

//ruta de desconeccion
router.get("/logout", async (req, res)=>{
  req.session.destroy((error)=>{
    if(error) {
      return res.json({status:"logout error", body: error })
    }
    res.redirect("../../login")
  }); 
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


//delete eliminar usuario
router.delete("/users/:uid", async(req, res)=>{
  let {uid} = req.params
  await userModel.deleteOne({_id: uid});
  res.json({message: "Usuario eliminado"});
});

module.exports = router;






//ruta para ingresar con un usuario RESPALDOOOO
/* router.post("/Login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Buscar un usuario en la base de datos por su email
    const user = await userModel.findOne({ email });

    if (user) {
      // Comprobar si la contraseña coincide usando la funcion isvalidpasword
      if (isValidPassword(user, password)) {
        if (user.rol === "admin") {
          // Generar un token de autenticación
          const token = generateToken(user);
          // Establecer las variables de sesión
          req.session.emailUsuario = email;
          req.session.nombreUsuario = user.nombre;
          req.session.apellidoUsuario = user.apellido;
          req.session.rolUsuario = user.rol;
          res.redirect("/profile");
        } else {
          // Generar un token de autenticación
          const token = generateToken(user);
          req.session.nombreUsuario = user.nombre;
          req.session.apellidoUsuario = user.apellido;
          req.session.emailUsuario = email;
          req.session.rolUsuario = user.rol;
          res.redirect("/allproducts");
        }
      } else {
        // datos incorrectos
        res.redirect("../../login");
      }
    } else {
      // No se encontró un usuario con ese email
      res.redirect("../../login");
    }
  } catch (error) {
    res.status(500).send("Error al ingresar" + error.message);
  }
}); */