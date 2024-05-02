const mongoose = require('mongoose');

const { Schema } = mongoose;

const sugerenciaSchema = new Schema({
  titulo: { type: String, required: true },
  cuerpo: { type: String, required: true },
});

module.exports = mongoose.model('Sugerencia', sugerenciaSchema);