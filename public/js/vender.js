
function updateTotal(row) {
    const cantidad = row.querySelector('.cantidad').value;
    const precio = row.querySelector('.precio').textContent;
    const total = row.querySelector('.total');
    total.textContent = (cantidad * precio).toFixed(2);
    updateTotalGlobal();
}

// Función para actualizar el total global
function updateTotalGlobal() {
    let totalGlobal = 0;
    document.querySelectorAll('.total').forEach(totalCell => {
        totalGlobal += parseFloat(totalCell.textContent);
    });
    document.getElementById('totalGlobal').textContent = totalGlobal.toFixed(2);
    document.getElementById('totalHidden').value=totalGlobal.toFixed(2);
    actualizarCambio();
}

const codigos= document.getElementById('codigos').value.split(",-,");
const nombres= document.getElementById('nombres').value.split(",-,");
const precios= document.getElementById('precios').value.split(",-,").map(Number);





function anadirProducto(){
    const cod= document.getElementById('codigoBarra');
    if (codigos.includes(cod.value)){
        let n=codigos.indexOf(cod.value);
        addRow(codigos[n], 1, nombres[n], precios[n], true);


    } else {
        alert("Codigo no registrado");
    }
    cod.value="";

}


function addRow(codigoBarra = "", cantidad = 1, nombre = "", precio = 0.00, editable = true) {
    const tableBody = document.querySelector('#productosTable tbody');
    const newRow = document.createElement('tr');
    const enviar= document.getElementById('enviar');

    newRow.innerHTML = `
        <td>
            <button class="delete-row-btn btn btn-danger">
            <img src="/icons/trash.png">
            </button>
            <input type="hidden" name="codigo[]" value="${codigoBarra}">
            <span class="codigo-barra">${codigoBarra}</span>
        </td>
        <td><input id="cantidad" name="cantidad[]" type="number" min="1" class="cantidad" value="${cantidad}"></td>
        <td><span class="nombre">${nombre}</span></td>
        <td><span id="precio" class="precio" >${precio.toFixed(2)}</span></td>
        <td><span id="total" class="total" >${(cantidad * precio).toFixed(2)}</span></td>
    `;

    tableBody.appendChild(newRow);


    newRow.querySelector('.delete-row-btn').addEventListener('click', function() {
        // Elimina la fila padre del botón
        this.closest('tr').remove();
        // Después de eliminar la fila, actualiza los totales
        updateTotalGlobal();
    });


    if (editable) {

        updateTotal(newRow);

        // Añadir eventos a los inputs de cantidad para calcular automáticamente
        newRow.querySelector('.cantidad').addEventListener('input', () => {
            updateTotal(newRow);
        });
    }
}



document.getElementById('precioPagar').addEventListener('input', () => {
    actualizarCambio();
});

function validar(){

    const total= document.getElementById('totalGlobal');
    if (Number(total.textContent)===0){
        alert("No hay ningún producto en la lista");
        return false;
    }


    const cambio = document.getElementById('cambio');
    if (Number(cambio.textContent)<0){
        alert("El dinero entregado es inferior al total a pagar");
        return false;
    }
    return true;
}

function actualizarCambio(){
    const cambio= document.getElementById('cambio');
    const totalGlobal= document.getElementById('totalGlobal');
    let precio= document.getElementById('precioPagar');
    cambio.textContent = (Number(precio.value) - Number(totalGlobal.textContent)).toFixed(2);
}

        // Añadir eventos a los inputs para calcular automáticamente
document.querySelectorAll('.cantidad, .precio').forEach(input => {
    input.addEventListener('input', () => {
        const row = input.closest('tr');
        updateTotal(row);
    });
});

// Calcular los totales inicialmente
document.querySelectorAll('tbody tr').forEach(row => {
    updateTotal(row);
});

document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar todos los formularios de reserva
    const forms = document.querySelectorAll('.pagar-form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar el envío del formulario
        alert('Compra realizada con éxito'); // Mostrar alerta
        form.submit(); // Enviar el formulario después de la alerta
      });
    });
  });