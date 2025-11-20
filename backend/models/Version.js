const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  documento: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Documento'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  contenido: {
    type: String,
    required: true
  }
}, {
  timestamps: true 
});

const Version = mongoose.model('Version', versionSchema);

module.exports = Version;