const mongoose = require('mongoose');

const auditoriaSchema = new mongoose.Schema({
    accion: {
        type: String,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    detalles: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

const Auditoria = mongoose.model('Auditoria', auditoriaSchema);

module.exports = Auditoria;
