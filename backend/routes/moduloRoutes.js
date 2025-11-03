const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/authMiddleware.js'); 
const Modulo = require('../models/Modulo.js'); 
const Documento = require('../models/Documento.js');

router.post('/', proteger, async (req, res) => { 
  try {
    const { nombre, descripcion } = req.body;

    const modulo = new Modulo({
      nombre,
      descripcion,
      user: req.user._id 
    });

    const moduloCreado = await modulo.save(); 
    res.status(201).json(moduloCreado);

  } catch (error) {
    res.status(400).json({ message: 'Error al crear el módulo', error: error.message });
  }
});


router.get('/', proteger, async (req, res) => { 
  try {
    const modulos = await Modulo.find({});
    res.json(modulos);

  } catch (error) {
    res.status(400).json({ message: 'Error al obtener los módulos', error: error.message });
  }
});

router.put('/:id', proteger, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const modulo = await Modulo.findById(req.params.id);

    if (modulo) {
      modulo.nombre = nombre || modulo.nombre;
      modulo.descripcion = descripcion || modulo.descripcion;

      const moduloActualizado = await modulo.save();
      res.json(moduloActualizado);
    } else {
      res.status(404).json({ message: 'No se encontro el Módulo' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el módulo', error: error.message });
  }
});

router.delete('/:id', proteger, async (req, res) => {
  try {
    const conteoDocumentos = await Documento.countDocuments({ modulo: req.params.id });

    if (conteoDocumentos > 0) {
      return res.status(400).json({ message: 'No se puede eliminar un módulo que contiene documentos.' });
    }

    const modulo = await Modulo.findById(req.params.id);

    if (modulo) {
      await modulo.deleteOne();
      res.json({ message: 'Módulo eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'No se encontro el Módulo' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;