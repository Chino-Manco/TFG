//Implementación de funcion de busqueda al boton de buscar en el catalogo
document.getElementById('busquedaForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
    var terminoBusqueda = document.getElementById('busquedaInput').value;
    window.location.href = '/catalogo/' + terminoBusqueda; // Redirigir al usuario
});