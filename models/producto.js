const mongoose = require('mongoose');

const { Schema } = mongoose;

const productoSchema = new Schema({
  codigoBarra: { type: String, required: false, default: null },
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  peso: { type: String, required: true },
  precio: { type: Number, required: true, min:0, decimal: true },
  ingredientes: { type: String, required: true },
  valorNutricional: { type: String, required: true },
  stock: { type: Number, required: false, min:0, decimal: false, default:0 },
  imagen: { type: Buffer, contentType: String, default:null },
});

module.exports = mongoose.model('Producto', productoSchema);