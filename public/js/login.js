$(document).ready(function() {
  // Selecciona el formulario
  var $form = $('.form');
  
  // Obtiene la altura del primer panel del formulario
  var panelOneHeight = $('.form-panel.one')[0].scrollHeight;
  
  // Obtiene la altura del segundo panel del formulario
  var panelTwoHeight = $('.form-panel.two')[0].scrollHeight;

  // Evento al hacer clic en el segundo panel del formulario cuando no está activo para desplegar el signup
  $('.form-panel.two').not('.form-panel.two.active').on('click', function(e) {
    e.stopPropagation(); 
    $('.form-toggle').addClass('visible'); 
    $('.form-panel.one').addClass('hidden'); 
    $('.form-panel.two').addClass('active'); 
    $form.css('height', panelTwoHeight); 
  });

  // Detiene la propagación del evento de clic dentro de cualquier elemento del segundo panel cuando el signup este activo
  $('.form-panel.two *').on('click', function(e) {
    e.stopPropagation();
  });

  // Evento al hacer clic en el botón de alternar formulario para volver al login
  $('.form-toggle').on('click', function(e) {
    e.preventDefault(); 
    $(this).removeClass('visible'); 
    $('.form-panel.one').removeClass('hidden');
    $('.form-panel.two').removeClass('active');
    $form.css('height', panelOneHeight); 
  });

  // Establece la altura inicial del formulario al tamaño del primer panel
  $form.css('height', panelOneHeight);
});

// Función para validar que las contraseñas coincidan
function validatePasswords() {
  const mensaje = document.getElementById('signupMessage');
  var password = document.getElementById('password').value;
  var cpassword = document.getElementById('cpassword').value; 
  
  // Comprueba si las contraseñas no coinciden
  if (password !== cpassword) {
    mensaje.textContent = "Las contraseñas no coinciden";
    return false;
  } else {
    mensaje.textContent = ""; 
    return true;
  }
}
