const mongoose = require('mongoose');

const moduloesquema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Modulo = mongoose.model('Modulo', moduloesquema);

module.exports = Modulo;