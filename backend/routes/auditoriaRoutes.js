const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/authMiddleware.js');
const Auditoria = require('../models/Auditoria.js');

router.get('/', proteger, async (req, res) => {
    try {
        const logs = await Auditoria.find({})
            .sort({ fecha: -1 })
            .populate('usuario', 'nombre correo');
        res.json(logs);
    } catch (error) {
        console.error('Error al obtener auditoría:', error);
        res.status(500).json({ message: 'Error al obtener el historial de auditoría' });
    }
});

module.exports = router;
