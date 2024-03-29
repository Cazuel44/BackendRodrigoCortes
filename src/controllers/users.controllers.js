const {userModel} = require("../dao/mongo/models/users.model.js");
const {cartModel} = require("../dao/mongo/models/carts.model.js");
const {messageModel} = require("../dao/mongo/models/messages.model.js");
const { createHash, isValidPassword, generateToken, generateTokenRecovery } = require('../utils');
const UserDTO = require("../dao/DTOs/user.dto.js");
const bcrypt = require("bcrypt")
const { transporter } = require("../routes/mailRouter");
const UserDao = require("../dao/mongo/users.mongo.js");
const logger = require("../logger.js");
const path = require("path")

const userDao = new UserDao();


async function getUserByEmail(email) {
  // Aquí debes escribir la lógica para buscar un usuario por su correo electrónico en la base de datos
  // Puedes usar un modelo de Mongoose para interactuar con tu base de datos
  const user = await userModel.findOne({ email }); // Suponiendo que tienes un modelo llamado 'User'

  return user; // Devuelves el usuario encontrado (o null si no se encontró)
}

// obtener todos los usuarios
async function getAllUsers(req, res) {
  try {
    let users = await userModel.find({}, "nombre email rol");
    res.send({ result: "success", payload: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

async function getUserById(req, res) {
  const { uid } = req.params;
  try {
    const user = await userModel.findById(uid);
    if (!user) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", payload: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al obtener el usuario por ID" });
  }
}
  
async function createUser(req, res) {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ status: "error", error: "Faltan datos" });
  }

  try {
    const usuario = await userModel.create({ nombre, apellido, email, password });
    res.json({ message: "Usuario creado con exito", user: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al crear el usuario" });
  }
}

async function registerUserAndMessage(req, res) {
  const { nombre, apellido, email, password, message, rol } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ status: "error", error: "Faltan datos" });
  }

  try {
    const existUser = await userModel.findOne({ email });
    if (existUser) {
      return res.status(400).json({ status: "error", error: "El correo ya existe" });
    }

    const newCart = await cartModel.create({ user: null, products: [], total: 0 });
    const newUser = new userModel({ nombre, apellido, email, password: createHash(password), rol: rol || "user", cartId: newCart._id });
    newUser.user = newUser._id;
    await newUser.save();

    newCart.user = newUser._id;
    await newCart.save();

    if (message) {
      const newMessage = new messageModel({ user: newUser._id, message });
      await newMessage.save();
    }

    res.redirect("/login");// no funciona
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al guardar usuario y mensaje" });
  }
}

// funcion para actualizar la ultima conexion de un usuario cada vez que ingresa con su cuenta
async function updateLastConnection(user) { 
  
  try {
    const userLastConnect = await userModel.findOne({ email: user.email });
    
    if(userLastConnect){
      userLastConnect.last_connection = new Date();
      await userLastConnect.save();
      logger.info("Ultima conexion actualizada")
    } else {
      logger.error("Usuario no encontrado")
    }
  } catch (error) {
    logger.info("error en guardar ultima connexion", error)
  }
}

// LOGIN
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user || !isValidPassword(user, password)) {
      logger.error("Usuario o contraseña incorrecta");
      return res.status(401).json({ message: "Usuario o contraseña incorrecta" });
    }
    // llama a la funcion que actualiza el campo de la ultima coneecion de  un usuario
    await updateLastConnection(user);

    const token = generateToken({ email: user.email, nombre: user.nombre, apellido: user.apellido, rol: user.rol });
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    const userCart = await cartModel.findById(user.cartId);

    logger.info("Inicio de sesión exitoso para el usuario: " + user.email);
    logger.info("Token generado para el usuario: " + token);
    logger.info("rol del usuario: " + user.rol);
    logger.info("Ultima conexion" + user.last_connection)
    // consolelog de usuario y token
    /* console.log("token desde usercontrolers",token)
    console.log(user) */
   

    res.status(200).json({ token, userCart });
  } catch (error) {
    res.status(500).json({ error: "Error al ingresar " + error.message });
  }
}



async function getUserInfo(req, res) {
  const user = req.user;
  res.json({ user });
}


async function logoutUser(req, res) {
  
  // Invalidar el token estableciendo una fecha de expiracion
  res.cookie("token", "", { expires: new Date(0) });

  // Redireccionar o enviar una respuesta según sea necesario
  res.redirect("../../login");
}

// ESTE LOGOUT ES PARA TRABAJAR CON SESSIONS EN ESTE CASO NO SE UTILIZA
/* async function logoutUser(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.json({ status: "Error al desconectarse", body: error });
    }
    res.redirect("../../login");
  });
} */

async function updateUser(req, res) {
  const { uid } = req.params;
  const userToReplace = req.body;
  try {
    const updateFields = { ...userToReplace };
    delete updateFields._id;

    const userUpdate = await userModel.findByIdAndUpdate(uid, updateFields, { new: true });

    if (!userUpdate) {
      logger.error("Usuario no encontrado al intentar actualizar");
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }

    logger.info("Usuario actualizado correctamente:", userUpdate);
    res.json({ status: "success", message: "Usuario actualizado", user: userUpdate });
  } catch (error) {
    logger.error("Error al actualizar el usuario:", error);
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al actualizar el usuario" });
  }
}

async function updatePasswordByEmail(req, res) {
  const { email, newPassword } = req.body;

  try {
    const user = await userDao.getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "No se encontró el usuario" });
    }

    const matchOldPassword = await bcrypt.compare(newPassword, user.password);

    if (matchOldPassword) {
      return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
    }

    const hashedPassword = createHash(newPassword);

    const userUpdate = await userDao.updatePassword(user._id, hashedPassword);

    if (!userUpdate) {
      throw new Error("Error al actualizar la contraseña");
    }

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(`Error al buscar al usuario o actualizar la contraseña: ${error}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
  
}

async function deleteUser(req, res) {
  const { uid } = req.params;
  try {
    await userModel.findByIdAndDelete(uid);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al eliminar el usuario" });
  }
}

//ruta para eliminar todos los usuarios que no tengas conexion en los ultimos 2 dias 
async function deleteUsers(req, res) {
  //define el numero de dias inactivo
  const inactiveTime = 2

  //fecha limite por inactividad se descuenta el inactivetime a limitdate que se inicializa con la fecha actual
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - inactiveTime);
  //intenta
  try {
    
    //obtiene todos los usuarios desde la base de datos que la ultima conexion  supera los 2 dias
    let inactiveUsers = await userModel.find({last_connection:{$lt: limitDate}});
    // se realiza verificacion si los usuarios obtenidos de la base de datos por inactividad es mayor a 0 si es asi los elimina
    if(inactiveUsers.length > 0){

      //elimina los usuarios almacenados en inactiveUsers
      await userModel.deleteMany({_id:{$in: inactiveUsers.map(user => user._id)}}) 

      // Elimina los carritos asociados a los usuarios eliminados utilizando el cartId de cada usuario
      await cartModel.deleteMany({ _id: { $in: inactiveUsers.map(user => user.cartId) } });

      // ENVÍO DE CORREO AL USUARIO ELIMINADO
      for (const usuario of inactiveUsers) {
        // Contenido del email
        const mailOptions = {  
          from: process.env.EMAIL_USER,
          to: usuario.email,
          subject: 'Cuenta eliminada',
          text: `Saludos ${usuario.nombre},\n\nEste correo es informativo, por el tiempo inactivo en nuestra aplicación, su cuenta sera eliminada de nuestra base de datos. \n\n BABAI `,
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error(error);
          }
        });
      }
      
      logger.warn("Usuarios eliminados:" + inactiveUsers)
      res.status(200).json("Usuarios eliminados con exito!");
    } else {
      res.json({message: "no hay usuarios inactivos para eliminar"})
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al eliminar los usuarios inactivos" });
  }
}


async function recuperacionCorreo(req, res) {
  const { email } = req.body; // Suponiendo que el campo de correo electrónico se envía desde el formulario de login

  try {
    const usuario = await userDao.getUserByEmail(email);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //generar token para expirar correo de reestablecimiento de pass
    
    const token = generateTokenRecovery({ email: usuario.email });
    if (!token) {
      return res.status(500).json({ message: 'Error al generar el token.' });
    }

    logger.info("token de recoverypass:" + token)
    // Genera el enlace de recuperación
    const recoveryLink = `http://localhost:8080/reset_password/${token}`;

    // Contenido del email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Hola ${usuario.nombre},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n\n${recoveryLink}\n\nSi no solicitaste un cambio de contraseña, ignora este mensaje.`,
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'error al enviar el correo.' });
      }
      return res.json({ message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
}


function allDocumentsRequired(user, documentosNecesarios) {
  // se obtienen los documentos de la base de datos del usuario
  const documentosUsuario = user.documents || [];

  // extraelos tipos de documentos del array de objetos y los almacena en la variable documento
  const tiposDocumentosUsuario = documentosUsuario.map(documento => documento.type);

  // verifica que existan todos los documentos requeridos
  return documentosNecesarios.every(documento => tiposDocumentosUsuario.includes(documento));
}

async function changeRol(req, res) {
  const { uid } = req.params;
  try {
    const user = await userDao.getUserById(uid);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // verifica si existen los tres documentos requeridos
    const documentosNecesarios = ["profileImage", "identificationPdf", "documentWord"];

    if (allDocumentsRequired(user, documentosNecesarios)) {
      // Cambiar el rol según la lógica deseada
      if (user.rol === "user") {
        user.rol = "premium";
      } else if (user.rol === "premium") {
        user.rol = "user";
      }

      const updatedUser = await user.save(); // Guardar el usuario con el nuevo rol

      res.json({ message: "Rol de usuario actualizado", user: updatedUser });
    } else {
      res.status(400).json({ message: "El usuario no tiene todos los documentos necesarios" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al cambiar el rol del usuario" });
  }
}

/* async function changeRol(req, res) {
  const { uid } = req.params;
  try {
    const user = await userDao.getUserById(uid)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Cambiar el rol según de user a premium y viceversa
    if (user.rol === "user") {
      user.rol = "premium";
    } else if (user.rol === "premium") {
      user.rol = "user";
    }

    const updatedUser = await user.save(); // Guardar el usuario con el nuevo rol

    res.json({ message: "Rol de usuario actualizado", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al cambiar el rol del usuario" });
  }
}
 */
// Función para subir archivos del usuario

const uploadDocuments = async (req, res) => {
  try {
    // Obtener el ID del usuario de la URL
    const userId = req.params.uid;

    // Verificar si req.files existe y contiene archivos
    if (req.files) {
      // Buscar el usuario en la base de datos
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Iterar sobre los archivos subidos y actualizar el modelo
      Object.keys(req.files).forEach((fileType) => {
        const file = req.files[fileType][0];
        const filePath = file.path;

        // Determinar el tipo de documento y agregarlo al array documents
        let documentType;
        if (fileType === "identificationImage") {
          documentType = "profileImage";
        } else if (fileType === "document") {
          documentType = "documentWord";
        } else if (fileType === "profilePhoto") {
          documentType = "identificationPdf";
        }

        // Agregar el objeto al array documents
        user.documents.push({ type: documentType, path: filePath });
      });

      // Guardar los cambios en la base de datos
      await user.save();

      res.status(200).json({ message: "Archivos cargados con éxito" });
    } else {
      res.status(400).json({ error: "No se han proporcionado archivos para cargar" });
    }
  } catch (error) {
    console.error("Error al subir archivos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



module.exports = {
  registerUserAndMessage,
  getUserById,
  loginUser,
  getUserInfo,
  logoutUser,
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
  getUserByEmail,
  recuperacionCorreo,
  updatePasswordByEmail,
  changeRol,
  uploadDocuments,
  deleteUsers,
};









/* async function updatePasswordByEmail(req, res) {
  const { email, newPassword } = req.body;

  try {
    const user = await userDao.getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "No se encontró el usuario" });
    }
    
    // Comparar la nueva contraseña con la anterior
    
    console.log(user.password)
    console.log(newPassword)

    const matchOldPassword = await bcrypt.compare(newPassword, user.password);
    

    console.log(matchOldPassword)
    if (matchOldPassword) {
      return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
      
    }
    console.log("hola")
    const hashedPassword = createHash(newPassword); 

    const userUpdate = await userDao.updatePassword(user._id, hashedPassword);
    if (!userUpdate) {
      return res.status(500).json({ error: "Error al actualizar la contraseña" });
    }

    
    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(`Error al buscar al usuario o actualizar la contraseña: ${error}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  } 
} */