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
  /* console.log("DOMContentLoaded se ha ejecutado correctamente."); */
  const formulario = document.getElementById("messageForm");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = document.getElementById("user").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    
    // Enviar los datos del formulario
    try {
      const response = await fetch("/saveuserymsge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, lastName, email, message })
        /* body: `nombre=${encodeURIComponent(user)}&apellido=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}` */
      });

      if (response.ok) {
        alert("Usuario y mensaje guardados con éxito");
        formulario.reset();
      } else {
        alert("Error al guardar el usuario y el mensaje");
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar el usuario y el mensaje");
    }
  });

  // busca los botones con clase detalle-buton
  const detalleButtons = document.querySelectorAll(".detalle-button");
  // agregar un evenlistener
  detalleButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const productId = event.currentTarget.dataset.productId;
      window.location.href = `/product/${productId}`;
    });

  }); 

});

