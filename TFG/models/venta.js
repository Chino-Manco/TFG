const mongoose = require('mongoose');

const { Schema } = mongoose;

const ventaSchema = new Schema({
  fechaHora: { type: Date, required: true },
  cliente: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  empleado: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'producto' }],
  total: { type: Number, required: true, min:0, decimal: true },
  cantidades: {
    type: [Number],
    required: false,
    min: 1,
    default: [0], // Valor por defecto como array de números
    validate: {
      validator: function(value) {
        return value.every(Number.isInteger); // Verifica que todos los elementos del array sean enteros
      },
      message: 'Todos los valores en el array deben ser enteros.'
    }
  }
});

module.exports = mongoose.model('Venta', ventaSchema);