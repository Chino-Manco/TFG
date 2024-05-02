const mongoose = require('mongoose');

const { Schema } = mongoose;

const asignaturaSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  grado: { type: String, required: true },
  usuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  urls: { type: [String], required: false },
  archivos: [{ nombre: String, ruta: String }] // Nuevo campo para almacenar información sobre los archivos subidos
});

module.exports = mongoose.model('Asignatura', asignaturaSchema);
