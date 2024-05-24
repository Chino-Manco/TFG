const mongoose = require('mongoose');

const { Schema } = mongoose;

const reservaSchema = new Schema({
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  cliente: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  cantidad: { type: Number, required: false, min:1, decimal: false, default:0 }
});

module.exports = mongoose.model('Reserva', reservaSchema);