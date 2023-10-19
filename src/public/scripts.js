const socket = io();

socket.on('conexion-establecida', (mensaje) => {
  console.log('Mensaje del servidor:', mensaje);
  
  
});

socket.on('newProduct', (data) => {
  console.log(data)
  const productsElements = document.getElementById('products');
  console.log(productsElements)
  const productElement = document.createElement('li');
  productElement.innerHTML = `${data.title} - ${data.description}`;
  productsElements.appendChild(productElement);

});

socket.on('deleteProduct', (id) => {
  console.log(id)
  const productElement = document.getElementById(id).remove();
  console.log(productElement)
  
});

document.addEventListener("DOMContentLoaded", () => {

  // EVENTO ENVIAR FORMULARIO REGISTRO
  console.log("DOMContentLoaded se ha ejecutado correctamente.");
  
  //EVENTO BOTON DETALLE
  // busca los botones con clase detalle-buton
  const detalleButtons = document.querySelectorAll(".detalle-button");
  // agregar un evenlistener
  detalleButtons.forEach((button) => {
    console.log("Evento de clic registrado en botón de detalle");
    button.addEventListener("click", function (event) {
      const productId = event.currentTarget.dataset.productId;
      window.location.href = `/product/${productId}`;
    });

  }); 

  
  const formulario = document.getElementById("messageForm");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message").value;

    // Verificar si el campo de mensaje está vacío
    const datos = { nombre, apellido, email, password, message };
    /* if (message.trim() !== "") {
      datos.message = message;
    } */
    
    // Enviar los datos del formulario
    try {
      const response = await fetch("/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      if (response.ok) {
        alert("Usuario y mensaje guardados con éxito");
        formulario.reset();
      } else {
        if(response.status === 400){
          alert("El correo ya esta registrado")
        } else {
          alert("Error al guardar el usuario y el mensaje");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrarse");
    }
  });


  //EVENTO LOGIN 
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Verificar que se ingresen email y contraseña
    if (email.trim() === "" || password.trim() === "") {
      alert("Por favor, ingresa tu email y contraseña.");
      return;
    }

    try {
      const response = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        alert("Inicio de sesión exitoso");
        window.location.href = "/allproducts";
      } else {
        alert("Correo o password incorrectos. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
    }
  });

});

