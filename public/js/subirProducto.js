//Funcion para manejar la nueva categoria en caso de que se elija dicha opcion
function toggleInput() {
    var select = document.getElementById("categoria");
    var inputContainer = document.getElementById("inputContainer");
    var nuevaCategoriaInput = document.getElementById("nuevaCategoria");
    
    if (select.value === "Input") {
        inputContainer.style.display = "block";
        nuevaCategoriaInput.setAttribute("required", "true"); // Hacer que el input sea requerido
    } else {
        inputContainer.style.display = "none";
        nuevaCategoriaInput.removeAttribute("required"); // Eliminar la propiedad requerida del input
    }
}