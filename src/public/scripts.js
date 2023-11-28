const socket = io();

socket.on('conexion-establecida', (mensaje) => {
  console.log('Mensaje del servidor:', mensaje);
  
  
});

socket.on('newProduct', (data) => {
  console.log(data)
  const productsElements = document.getElementById("products");
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
    
    button.addEventListener("click", function (event) {
      const productId = event.currentTarget.dataset.productId;
      window.location.href = `/product/${productId}`;
    });

  }); 


  const carritoBtn = document.getElementById("carrito-compra");
  console.log(carritoBtn);
  async function obtenerIdCarrito() {
    console.log('Ejecutando obtenerIdCarrito')
    try {
      console.log("pasando1")
      const response = await fetch("/api/carts/getusercart", {
        method: 'GET', // Agrega el método GET
        headers: {
          'Content-Type': 'application/json',
          
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.cart; // Asegúrate de usar la propiedad correcta que contiene el ID del carrito
      } else {
        const errorData = await response.json();
        console.error('No se pudo obtener el ID del carrito:', errorData);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el ID del carrito:', error);
      return null;
    }
  }

  if (carritoBtn) {
    carritoBtn.addEventListener("click", async () => {
      try {
        const carritoId = await obtenerIdCarrito();
        if (carritoId) {
          window.location.href = `/cart/detail/${carritoId}`;
        } else {
          console.error("No se pudo obtener el ID del carrito.");
        }
      } catch (error) {
        console.error("Error al obtener el ID del carrito:", error);
      }
    });
  }

  
  const formulario = document.getElementById("messageForm");
  if(formulario){
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
  }
  


  
  //EVENTO LOGIN antiguo
  const loginForm = document.getElementById("loginForm");
  if(loginForm){
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      // Verificar que se ingresen email y contraseña
      if (email.trim() === "" || password.trim() === "") {
        alert("Por favor, ingresa tu email y contraseña.");
        return;
      }
  
      // en la ruta tenia /api/session/login
      try {
  
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });
        console.log("response", response)
        if (response.ok) {
          const data = await response.json();
          const token = data.token;
          console.log(token)
          // Almacena el token en localStorage para sesiones posteriores (opcional)
          /* localStorage.setItem("token", token); */
  
          // Determina la redirección según el rol del usuario
          const userResponse = await fetch("/api/sessions/user", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
  
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const { rol } = userData;
  
            if (rol === "admin") {
              window.location.href = "/profile"; // Redirige a la página de perfil de administrador
            } else {
              window.location.href = "/allproducts"; // Redirige a la página de productos para usuarios
            }
          } else {
            alert("Error al obtener información del usuario. Por favor, inténtalo de nuevo más tarde.");
          }
        } else {
          alert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.");
        }
      } catch (error) {
        console.error(error);
        alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
      }
    });
  }
  
  
  

});








//EVENTO LOGIN antiguo
/* const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Verificar que se ingresen email y contraseña
  if (email.trim() === "" || password.trim() === "") {
    alert("Por favor, ingresa tu email y contraseña.");
    return;
  }

  // en la ruta tenia /api/session/login
  try {
    
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    console.log("response", response)
    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      console.log(token)
      // Almacena el token en localStorage para sesiones posteriores (opcional)
      /* localStorage.setItem("token", token); 
      
      // Determina la redirección según el rol del usuario
      const userResponse = await fetch("/api/sessions/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const { rol } = userData;

        if (rol === "admin") {
          window.location.href = "/profile"; // Redirige a la página de perfil de administrador
        } else {
          window.location.href = "/allproducts"; // Redirige a la página de productos para usuarios
        }
      } else {
        alert("Error al obtener información del usuario. Por favor, inténtalo de nuevo más tarde.");
      }
    } else {
      alert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
}); */


//EVENTO LOGIN NUEVO
/* const loginForm = document.getElementById("loginForm");
  
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
      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);
      alert("Inicio de sesión exitoso");
    
      // Realiza una nueva solicitud para obtener la información del usuario
      const userResponse = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userRole = userData.rol;
      
        if (userRole === "admin") {
          window.location.href = "/profile"; // Redirige a la página de perfil de administrador
        } else {
          window.location.href = "/allproducts"; // Redirige a la página de productos para usuarios normales
        }
      } else {
        alert("Error al obtener información del usuario. Por favor, inténtalo de nuevo.");
      }
    } else {
      alert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
}); */


//EVENTO LOGIN prueba
/* const loginForm = document.getElementById("loginForm");

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
      const data = await response.json();
      const token = data.token;
      console.log(token)
      await handleSuccessfulLogin(token);
    } else {
      alert("Correo o password incorrectos. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
});

async function handleSuccessfulLogin(token) {
  const response = await fetch("/api/sessions/allproducts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.ok) {
    alert("Inicio de sesión exitoso");
    
  } else {
    alert("Error al obtener los productos. Por favor, inténtalo de nuevo más tarde.");
  }
} */