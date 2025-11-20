
const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/authMiddleware.js');
const Version = require('../models/Version.js');

router.post('/', proteger, async (req, res) => {
  try {
    const { documentoId, contenido } = req.body; 

    if (!documentoId || contenido == null) {
      return res.status(400).json({ message: 'Faltan datos (documentoId o contenido)' });
    }

    const nuevaVersion = new Version({
      documento: documentoId,
      contenido: contenido,
      user: req.user._id 
    });

    const versionGuardada = await nuevaVersion.save();
    res.status(201).json(versionGuardada);

  } catch (error) {
    console.error('Error al guardar la versión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/latest/:documentoId', proteger, async (req, res) => {
  try {
    const { documentoId } = req.params;

    const versiones = await Version.find({ 
      documento: documentoId 
    })
    .sort({ createdAt: -1 }) 
    .limit(1); 

    if (!versiones || versiones.length === 0) {
      return res.status(404).json({ message: 'No se encontraron versiones para este documento' });
    }

    const ultimaVersion = versiones[0];
    
    res.json(ultimaVersion); 

  } catch (error) {
    console.error('Error al obtener la última versión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;