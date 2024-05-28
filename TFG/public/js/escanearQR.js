const codigoBarraInput = document.getElementById("codigoBarra");
    const scanQRButton = document.getElementById("scanQRButton");
    const stopQRButton = document.getElementById("stopQRButton");
    const videoContainer = document.getElementById("videoContainer");
    const videoElement = document.getElementById("videoElement");
    let cameraStopped = false;
    let codeReader = null;

// Función para iniciar la cámara y escanear el código QR
async function iniciarCamaraYEscaneo() {
    try {
        cameraStopped = false;
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.srcObject = stream;
        videoContainer.style.display = "block";
        scanQRButton.disabled = true;
        stopQRButton.disabled = false;

        // Iniciar QR Code Reader
        codeReader = new ZXing.BrowserQRCodeReader();
        await codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result && !cameraStopped) {
                codigoBarraInput.value = result.getText();
                detenerCamara();
                cameraStopped = true;
            }
        });
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}

// Función para detener la cámara y liberar recursos
function detenerCamara() {
    stopQRButton.disabled = true;
    const stream = videoElement.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    videoContainer.style.display = "none";
    scanQRButton.disabled = false;

    // Detener el lector de códigos QR
    if (codeReader) {
        codeReader.reset();
        codeReader = null;
    }
}

// Evento click para iniciar el escaneo del código QR
scanQRButton.addEventListener("click", iniciarCamaraYEscaneo);
stopQRButton.addEventListener("click", detenerCamara);