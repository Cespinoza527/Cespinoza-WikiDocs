const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { proteger } = require('../middleware/authMiddleware.js');
const Documento = require('../models/Documento.js');
const Version = require('../models/Version.js');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const { path: rutaTemporal, mimetype: tipoArchivo } = req.file;

    if (tipoArchivo === 'text/plain') {
      const contenidoTexto = fs.readFileSync(rutaTemporal, 'utf8');

      const nuevoDocumento = new Documento({
        titulo,
        user: req.user._id,
        modulo: moduloId,
        rutaArchivo: null, 
        tipoArchivo: tipoArchivo
      });
      const documentoGuardado = await nuevoDocumento.save();

      const nuevaVersion = new Version({
        documento: documentoGuardado._id,
        contenido: contenidoTexto,
        user: req.user._id
      });
      await nuevaVersion.save();

      fs.unlinkSync(rutaTemporal);

      res.status(201).json(documentoGuardado);

    } else {

      const nuevoDocumento = new Documento({
        titulo,
        user: req.user._id,
        modulo: moduloId,
        rutaArchivo: rutaTemporal, 
        tipoArchivo: tipoArchivo
      });
      
      const documentoGuardado = await nuevoDocumento.save();
      res.status(201).json(documentoGuardado);
    }

  } catch (error) {
    console.error('ERROR DETALLADO AL SUBIR:', error);
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

router.get('/:id', proteger, async (req, res) => {
  try {
    const documento = await Documento.findById(req.params.id);

    if (documento) {
      res.json(documento);
    } else {
      res.status(404).json({ message: 'Documento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


router.post('/:id/ask', proteger, async (req, res) => {
  try {
    const { pregunta } = req.body;
    if (!pregunta) {
      return res.status(400).json({ message: 'No se proporcionó ninguna pregunta' });
    }

    const documento = await Documento.findById(req.params.id);
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    let contenidoTexto = '';

    if (documento.tipoArchivo === 'application/pdf') {

      const rutaCompleta = path.join(__dirname, '..', documento.rutaArchivo);
      const dataBuffer = fs.readFileSync(rutaCompleta);
      const data = await pdfParse(dataBuffer);
      contenidoTexto = data.text;

    } else if (documento.tipoArchivo === 'text/plain') {

      const ultimaVersion = await Version.findOne({ 
        documento: documento._id 
      }).sort({ createdAt: -1 });

      if (!ultimaVersion) {
        return res.status(404).json({ message: 'No se encontró contenido para este documento' });
      }
      contenidoTexto = ultimaVersion.contenido;

    } else {
      return res.status(400).json({ message: 'No se puede procesar este tipo de archivo con la IA' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Basándote únicamente en el siguiente texto, responde la pregunta. Si la respuesta no se encuentra en el texto, di "No encontré información sobre eso en el documento", por otra parte si encuentras la información, di en que paginas del documento se encuentra y si es posible el parrafo.

    ---
    CONTEXTO DEL DOCUMENTO:
    ${contenidoTexto}
    ---

    PREGUNTA:
    ${pregunta}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const respuestaIA = response.text();

    res.json({ respuesta: respuestaIA });

  } catch (error) {
    console.error('Error al procesar la pregunta de IA:', error);
    res.status(500).json({ message: 'Error en el servidor de IA' });
  }
});

module.exports = router;

