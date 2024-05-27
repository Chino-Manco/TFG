//Función que carga y renderiza la imagen en pantalla
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

//Función que permite arrastrar y soltar imagen para cargarla
function handleDragOver(event) {
    event.preventDefault();
    const dropArea = document.getElementById('dropArea');
    dropArea.style.border = '2px dashed #aaa';
}

//Funcion que comprueba que el archivo soltado para cargar sea una imagen 
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