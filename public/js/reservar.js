//Funcion para mostrar un mensaje en alert antes de confirmar el envio del form
document.addEventListener('DOMContentLoaded', () => {
  // Seleccionar todos los formularios de reserva
  const forms = document.querySelectorAll('.reserva-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Evitar el envío del formulario
      alert('Reserva realizada con éxito'); // Mostrar alerta
      form.submit(); // Enviar el formulario después de la alerta
    });
  });
});