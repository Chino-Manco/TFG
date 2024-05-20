// Función para ordenar alfabéticamente una lista
function ordenarLista(listaId) {
    const lista = document.getElementById(listaId);
    const correos = Array.from(lista.querySelectorAll('li'));
    const correosOrdenados = correos.sort((a, b) => a.textContent.localeCompare(b.textContent));

    // Eliminar los elementos actuales de la lista
    correos.forEach(correo => lista.querySelector('ul').removeChild(correo));

    // Agregar los correos ordenados a la lista
    correosOrdenados.forEach(correo => lista.querySelector('ul').appendChild(correo));
}

// Función para mover correos
function moverCorreos(origenId, destinoId) {
    const origen = document.getElementById(origenId);
    const destino = document.getElementById(destinoId);
    const correosSeleccionados = Array.from(origen.querySelectorAll('li.selected'));

    // Mover correos seleccionados al destino
    correosSeleccionados.forEach(correo => {
        destino.querySelector('ul').appendChild(correo);
        correo.classList.remove('selected');
    });

    // Ordenar ambas listas alfabéticamente
    ordenarLista('clientes');
    ordenarLista('empleados');
}

function deseleccionarTodos() {
    const todosLosCorreos = document.querySelectorAll('li');
    todosLosCorreos.forEach(correo => {
        correo.classList.remove('selected');
    });
}

document.addEventListener('click', function(event) {
    if (event.target.tagName.toLowerCase() === 'li') {
        event.target.classList.toggle('selected');
    }
});

function enviarFormulario() {
    const clientes = Array.from(document.getElementById('clientes').querySelectorAll('li')).map(li => li.dataset.email);
    const empleados = Array.from(document.getElementById('empleados').querySelectorAll('li')).map(li => li.dataset.email);

    document.getElementById('clientesInput').value = JSON.stringify(clientes);
    document.getElementById('empleadosInput').value = JSON.stringify(empleados);

    document.getElementById('userForm').submit();
}