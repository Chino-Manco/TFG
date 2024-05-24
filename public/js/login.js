$(document).ready(function() {
  var $form = $('.form');
  var panelOneHeight = $('.form-panel.one')[0].scrollHeight;
  var panelTwoHeight = $('.form-panel.two')[0].scrollHeight;

  $('.form-panel.two').not('.form-panel.two.active').on('click', function(e) {
    e.stopPropagation();
    $('.form-toggle').addClass('visible');
    $('.form-panel.one').addClass('hidden');
    $('.form-panel.two').addClass('active');
    $form.css('height', panelTwoHeight);
  });

  $('.form-panel.two *').on('click', function(e) {
    e.stopPropagation();
  });

  $('.form-toggle').on('click', function(e) {
    e.preventDefault();
    $(this).removeClass('visible');
    $('.form-panel.one').removeClass('hidden');
    $('.form-panel.two').removeClass('active');
    $form.css('height', panelOneHeight);
  });

  // Set initial form height
  $form.css('height', panelOneHeight);
});

function validatePasswords() {
  const mensaje= document.getElementById('signupMessage');
  var password = document.getElementById('password').value;
  var cpassword = document.getElementById('cpassword').value;
  if (password !== cpassword) {
    mensaje.textContent="Las contraseñas no coinciden";
    return false;
  } else {
    mensaje.textContent="";
    return true;
  }
}