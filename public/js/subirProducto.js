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


function chooseFile() {
    document.getElementById('fileInput').click();
}

function uploadAndDisplay(event) {
    const fileInput = event.target;
    const imageContainer = document.getElementById('imageContainer');

    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            const imageUrl = reader.result;
            imageContainer.innerHTML = `<img src="${imageUrl}" alt="Foto cargada">`;;
        }
    }
}

function handleDragOver(event) {
    event.preventDefault();
    const dropArea = document.getElementById('dropArea');
    dropArea.style.border = '2px dashed #aaa';
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('image/')) {
        const fileInput = document.getElementById('fileInput');
        fileInput.files = event.dataTransfer.files;
        uploadAndDisplay({ target: fileInput });
    } else {
        alert('Por favor, arrastre y suelte solo archivos de imagen.');
    }
}