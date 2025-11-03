const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  modulo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Modulo'
  },
  rutaArchivo: { 
    type: String,
    required: true
  },
  tipoArchivo: { 
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Documento = mongoose.model('Documento', documentoSchema);

module.exports = Documento;