const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { proteger } = require('../middleware/authMiddleware.js');
const Documento = require('../models/Documento.js');

const almacenamiento = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'archivos/'); 
  },
  filename(req, file, cb) {
    cb(null, `documento-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const subida = multer({ storage: almacenamiento });
router.post('/subir', proteger, subida.single('documento'), async (req, res) => {
  try {
    const { titulo, moduloId } = req.body;

    const nuevoDocumento = new Documento({
      titulo,
      user: req.user._id,
      modulo: moduloId,
      rutaArchivo: req.file.path, 
      tipoArchivo: req.file.mimetype 
    });

    const documentoCreado = await nuevoDocumento.save();
    res.status(201).json(documentoCreado);

  } catch (error) {

    res.status(400).json({ message: 'Error al subir el documento', error: error.message });
  }
});

router.get('/por-modulo/:moduloId', proteger, async (req, res) => {
  try {
    const documentos = await Documento.find({ modulo: req.params.moduloId });

    if (documentos) {
      res.json(documentos);
    } else {
      res.status(404).json({ message: 'No se encontraron documentos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;