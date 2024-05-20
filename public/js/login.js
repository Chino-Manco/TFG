$(document).ready(function() {
  var panelOne = $('.form-panel.two').height(),
    panelTwo = $('.form-panel.two')[0].scrollHeight;

  $('.form-panel.two').not('.form-panel.two.active').on('click', function(e) {
    e.stopPropagation();

    $('.form-toggle').addClass('visible');
    $('.form-panel.one').addClass('hidden');
    $('.form-panel.two').addClass('active');
    $('.form').animate({
      'height': panelTwo
    }, 200);
  });

  $('.form-panel.two *').on('click', function(e) {
    e.stopPropagation();
  });

  $('.form-toggle').on('click', function(e) {
    e.preventDefault();
    $(this).removeClass('visible');
    $('.form-panel.one').removeClass('hidden');
    $('.form-panel.two').removeClass('active');
    $('.form').animate({
      'height': panelOne
    }, 200);
  });
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