function habilitarEdicion() {
    // Ocultar botón de edición y mostrar botones de guardar y cancelar
    document.getElementById("editar-btn").classList.add("hidden");
    document.getElementById("eliminar-btn").classList.add("hidden");
    document.getElementById("guardar-btn").classList.remove("hidden");
    document.getElementById("cancelar-btn").classList.remove("hidden");

    
    const emailElement = document.getElementById('email');
    const nombreElement = document.getElementById('nombre');
    const apellidosElement = document.getElementById('apellidos');
    const dniElement = document.getElementById('dni');
    const edadElement = document.getElementById('edad');

    //Sustituye los elementos por inputs para editar el perfil
    emailElement.innerHTML = '<input type="text" id="email-input" value="' + emailElement.innerText + '" disabled>'+ 
    '<input type="hidden"name="email" value="' + emailElement.innerText + '" >';
    nombreElement.innerHTML = '<input type="text" id="nombre-input" name="nombre" value="' + nombreElement.innerText + '">';
    apellidosElement.innerHTML = '<input type="text" id="apellidos-input" name="apellidos" value="' + apellidosElement.innerText + '">';
    dniElement.innerHTML = '<input type="text" id="dni-input" name="dni" value="' + dniElement.innerText + '" disabled>';
    edadElement.innerHTML = '<input type="number" id="edad-input" name="edad" value="' + edadElement.innerText + '">';

}

//Ocultar botones ya que se cancela la edicion
function cancelarEdicion() {
    document.getElementById("guardar-btn").classList.add("hidden");
    document.getElementById("cancelar-btn").classList.add("hidden");
    document.getElementById("editar-btn").classList.remove("hidden");
    document.getElementById("eliminar-btn").classList.remove("hidden");

    // Recargar la página para cancelar la edición
    location.reload();
}

//Confirmacion de eliminacion de cuenta
function confirmarEnvio() {
    var confirmacion = window.confirm("¿Estás seguro de que quieres ELIMINAR tu cuenta de forma PERMANENTE?");
    return confirmacion;
  }
