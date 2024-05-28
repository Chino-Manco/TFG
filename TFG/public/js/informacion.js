//Función de habilitación de edición de stock
function modificarStock(){
    document.getElementById("editar-btn").classList.add("hidden");
    document.getElementById("guardar-btn").classList.remove("hidden");
    document.getElementById("cancelar-btn").classList.remove("hidden");

    var stockElemento = document.getElementById("producto-stock");
    stockElemento.innerHTML = '<input type="number" id="stock-input" min="0" name="stock" value="' + stockElemento.innerText + '" >';

}

//Función de habilitación de edición de la informacion del producto
function habilitarEdicion() {
    // Ocultar botón de edición y mostrar botones de guardar y cancelar
    document.getElementById("editar-btn").classList.add("hidden");
    document.getElementById("guardar-btn").classList.remove("hidden");
    document.getElementById("cancelar-btn").classList.remove("hidden");

    // Mostrar sección de carga de archivo
    document.getElementById("file-upload-section").classList.remove("hidden");

    // Obtener elementos
    var nombreElemento = document.getElementById("producto-nombre");
    var precioElemento = document.getElementById("producto-precio");
    var categoriaElemento = document.getElementById("producto-categoria");
    var codigoElemto = document.getElementById("producto-codigo");
    var pesoElemento = document.getElementById("producto-peso");
    var ingredientesElemento = document.getElementById("producto-ingredientes");
    var nutricionalElemento = document.getElementById("producto-nutricional");
    var stockElemento = document.getElementById("producto-stock");

    // Convertir h2 y p en input y textarea
    nombreElemento.innerHTML = '<input type="text" id="nombre-input" name="nombre" value="' + nombreElemento.innerText + '">';
    precioElemento.innerHTML = '<input type="text" id="precio-input" name="precio" required pattern="[0-9]+(\.[0-9]{1,2})?" title="Por favor, introduce solo números enteros o con 2 decimales (por ejemplo, 10 o 10.50)" value="' + precioElemento.innerText + '">';
    codigoElemto.innerHTML = '<input type="text" id="codigo-input" value="' + codigoElemto.innerText + '" disabled>'
    categoriaElemento.innerHTML = '<input type="text" id="categoria-input" name="categoria" value="' + categoriaElemento.innerText + '">';
    pesoElemento.innerHTML = '<input type="number" id="peso-input" name="peso" value="' + pesoElemento.innerText + '">';
    ingredientesElemento.innerHTML = '<textarea id="ingredientes-input" name="ingredientes" rows="5" style="width: 100%;">' + ingredientesElemento.innerText +'</textarea>';
    nutricionalElemento.innerHTML = '<textarea id="nutricional-input" name="nutricional" rows="5" style="width: 100%;">'+ nutricionalElemento.innerText +'</textarea>';
    stockElemento.innerHTML = '<input type="number" id="stock-input" min="0" name="stock" value="' + stockElemento.innerText + '" >';

}

//Cancelación del modo de edición
function cancelarEdicion() {
    document.getElementById("guardar-btn").classList.add("hidden");
    document.getElementById("cancelar-btn").classList.add("hidden");
    document.getElementById("editar-btn").classList.remove("hidden");

    // Ocultar sección de carga de archivo
    document.getElementById("file-upload-section").classList.add("hidden");


    // Recargar la página para cancelar la edición
    location.reload();
}