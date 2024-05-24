const codigoBarraInput = document.getElementById("codigoBarra");
    const scanQRButton = document.getElementById("scanQRButton");
    const stopQRButton = document.getElementById("stopQRButton");
    const videoContainer = document.getElementById("videoContainer");
    const videoElement = document.getElementById("videoElement");
    let cameraStopped = false;

    // Función para iniciar la cámara y escanear el código de barras
async function iniciarCamaraYEscaneo() {
    try {

        cameraStopped = false;
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoContainer.style.display = "block";
        scanQRButton.disabled = true;
        stopQRButton.disabled = false;

        // Iniciar Quagga para escanear códigos de barras
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: videoElement
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
            }
        }, function(err) {
            if (err) {
                console.error('Error al iniciar Quagga:', err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(detectedHandler);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}




function detectedHandler(result) {
    if (result.codeResult && !cameraStopped) {
        codigoBarraInput.value = result.codeResult.code;
        detenerCamara();
        cameraStopped = true;
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

    // Liberar recursos eliminando el objeto de flujo de medios
    if (window.stream) {
        window.stream.getTracks().forEach(track => track.stop());
        delete window.stream;
    }
}



    // Evento click para iniciar el escaneo del código de barras
    scanQRButton.addEventListener("click", iniciarCamaraYEscaneo);
    stopQRButton.addEventListener("click", detenerCamara);